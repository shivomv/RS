# ==============================================================================
# RS Mobile Apps Automated Build, Version Bump & S3 Deployment Script
# Targets: Shopkeeper (UI) App & Admin (ADMIN_APP) App
# Bucket: s3.shivomverma.in (Region: ap-south-1)
# S3 Structure:
#   s3://s3.shivomverma.in/apps/buyer/ (Buyer App APKs)
#   s3://s3.shivomverma.in/apps/admin/ (Admin App APKs)
# ==============================================================================

param (
    [ValidateSet("both", "ui", "admin", "buyer")]
    [string]$App = "both",

    [ValidateSet("patch", "minor", "major", "none")]
    [string]$Bump = "patch",

    [switch]$SkipBuild,

    [string]$Bucket = "s3.shivomverma.in",
    [string]$Region = "ap-south-1",
    [string]$S3BasePrefix = "apps",
    [string]$AccessKey = "",
    [string]$SecretKey = ""
)

$ErrorActionPreference = "Stop"

$WorkspaceRoot = $PSScriptRoot
$ArtifactsDir = Join-Path $WorkspaceRoot "dist\apks"
if (-not (Test-Path $ArtifactsDir)) {
    New-Item -ItemType Directory -Path $ArtifactsDir -Force | Out-Null
}

# 1. Load AWS Credentials safely from Environment or .env file (Prevents GitHub Secret Leak)
function Load-AwsCredentials {
    $foundKey = $AccessKey
    $foundSecret = $SecretKey

    if (-not $foundKey) { $foundKey = $env:AWS_ACCESS_KEY_ID }
    if (-not $foundSecret) { $foundSecret = $env:AWS_SECRET_ACCESS_KEY }

    $candidateEnvFiles = @(
        (Join-Path $WorkspaceRoot ".aws-credentials.env"),
        (Join-Path $WorkspaceRoot "backend\.env"),
        "D:\.secrets\aws-credentials.env"
    )

    foreach ($file in $candidateEnvFiles) {
        if ((-not $foundKey -or -not $foundSecret) -and (Test-Path $file)) {
            $lines = Get-Content $file
            foreach ($line in $lines) {
                if ($line -match '^\s*AWS_ACCESS_KEY_ID\s*=\s*(.+)$') {
                    if (-not $foundKey) { $foundKey = $matches[1].Trim() }
                }
                if ($line -match '^\s*AWS_SECRET_ACCESS_KEY\s*=\s*(.+)$') {
                    if (-not $foundSecret) { $foundSecret = $matches[1].Trim() }
                }
            }
        }
    }

    if (-not $foundKey -or -not $foundSecret) {
        throw "AWS Credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY or create .aws-credentials.env."
    }

    $env:AWS_ACCESS_KEY_ID = $foundKey
    $env:AWS_SECRET_ACCESS_KEY = $foundSecret
    $env:AWS_DEFAULT_REGION = $Region
}

Load-AwsCredentials

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host " RS Mobile Apps: Automated Build & S3 Deployment" -ForegroundColor Cyan
Write-Host " Target App(s): $App | Version Bump: $Bump" -ForegroundColor Cyan
Write-Host " S3 Bucket: $Bucket (Region: $Region)" -ForegroundColor Cyan
Write-Host " S3 Folders: apps/buyer/ & apps/admin/" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

function Bump-AppVersion {
    param (
        [string]$AppDir,
        [string]$AppLabel
    )

    $PkgPath = Join-Path $AppDir "package.json"
    $GradlePath = Join-Path $AppDir "android\app\build.gradle"

    if (-not (Test-Path $PkgPath)) {
        throw "package.json not found in $AppDir"
    }
    if (-not (Test-Path $GradlePath)) {
        throw "build.gradle not found in $GradlePath"
    }

    $pkgJson = Get-Content $PkgPath -Raw | ConvertFrom-Json
    $currentVer = $pkgJson.version
    if (-not $currentVer) { $currentVer = "1.0.0" }

    $verParts = $currentVer.Split('.')
    $major = if ($verParts.Length -ge 1) { [int]$verParts[0] } else { 1 }
    $minor = if ($verParts.Length -ge 2) { [int]$verParts[1] } else { 0 }
    $patch = if ($verParts.Length -ge 3) { [int]$verParts[2] } else { 0 }

    if ($Bump -eq "patch") {
        $patch++
    } elseif ($Bump -eq "minor") {
        $minor++
        $patch = 0
    } elseif ($Bump -eq "major") {
        $major++
        $minor = 0
        $patch = 0
    }

    $newVer = "$major.$minor.$patch"

    # Read/Update build.gradle
    $gradleContent = Get-Content $GradlePath -Raw
    $newCode = 1

    if ($gradleContent -match 'versionCode\s*=?\s*(\d+)') {
        $oldCode = [int]$matches[1]
        $newCode = if ($Bump -ne "none") { $oldCode + 1 } else { $oldCode }
    }

    if ($Bump -ne "none") {
        # Update package.json
        $pkgContent = Get-Content $PkgPath -Raw
        $updatedPkg = $pkgContent -replace '"version"\s*:\s*"[^"]+"', "`"version`": `"$newVer`""
        Set-Content -Path $PkgPath -Value $updatedPkg -NoNewline

        $gradleContent = $gradleContent -replace 'versionCode\s*=?\s*\d+', "versionCode = $newCode"
        $gradleContent = $gradleContent -replace 'versionName\s*=?\s*"[^"]+"', "versionName = `"$newVer`""
        Set-Content -Path $GradlePath -Value $gradleContent -NoNewline

        Write-Host "[VERSION] ${AppLabel}: $currentVer (Code: $($newCode - 1)) -> $newVer (Code: $newCode)" -ForegroundColor Green
    } else {
        Write-Host "[VERSION] ${AppLabel}: $currentVer (Code: $newCode) [No Bump]" -ForegroundColor Gray
    }

    return @{
        Version = $newVer
        Code = $newCode
    }
}

function Build-And-Upload {
    param (
        [string]$AppKey,         # "ui" or "admin"
        [string]$AppLabel,       # "RS Buyer App" or "RS Admin App"
        [string]$AppDir,         # Path to app directory
        [string]$ApkPrefix,      # "rs-buyer" or "rs-admin"
        [string]$SubFolder       # "buyer" or "admin"
    )

    Write-Host "`n>>> [STEP 1/3] Updating version for $AppLabel..." -ForegroundColor Yellow
    $verInfo = Bump-AppVersion -AppDir $AppDir -AppLabel $AppLabel
    $version = $verInfo.Version
    $code = $verInfo.Code

    if (-not $SkipBuild) {
        Write-Host "`n>>> [STEP 2/3] Building Release APK for $AppLabel (assembleRelease)..." -ForegroundColor Yellow
        $androidDir = Join-Path $AppDir "android"
        Push-Location $androidDir

        try {
            cmd.exe /c ".\gradlew.bat assembleRelease"
            if ($LASTEXITCODE -ne 0) {
                throw "Gradle assembleRelease failed with exit code $LASTEXITCODE"
            }
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "`n>>> [STEP 2/3] Skipping build (-SkipBuild specified), using existing APK..." -ForegroundColor Yellow
    }

    $outputApk = Join-Path $AppDir "android\app\build\outputs\apk\release\app-release.apk"
    if (-not (Test-Path $outputApk)) {
        # Fallback to any recent release apk
        $releaseDir = Join-Path $AppDir "android\app\build\outputs\apk\release"
        $found = Get-ChildItem -Path $releaseDir -Filter "*.apk" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($found) {
            $outputApk = $found.FullName
        } else {
            throw "Expected release APK not found in: $releaseDir"
        }
    }

    $apkSizeMB = [math]::Round(((Get-Item $outputApk).Length / 1MB), 2)
    Write-Host "[BUILD SUCCESS] Generated APK: $outputApk ($apkSizeMB MB)" -ForegroundColor Green

    # Destination folder inside S3: e.g. apps/buyer/ or apps/admin/
    $s3TargetPrefix = "$S3BasePrefix/$SubFolder"

    # Local Artifacts
    $appArtifactsDir = Join-Path $ArtifactsDir $SubFolder
    if (-not (Test-Path $appArtifactsDir)) {
        New-Item -ItemType Directory -Path $appArtifactsDir -Force | Out-Null
    }

    # Permanent single APK name per user requirement (no version in filename so URL never changes)
    $fixedApkName = "$ApkPrefix.apk"
    $localFixedApk = Join-Path $appArtifactsDir $fixedApkName
    Copy-Item $outputApk $localFixedApk -Force

    Write-Host "`n>>> [STEP 3/3] Uploading APK to AWS S3 (s3://$Bucket/$s3TargetPrefix/$fixedApkName)..." -ForegroundColor Yellow

    # Upload single permanent APK
    aws s3 cp "$localFixedApk" "s3://$Bucket/$s3TargetPrefix/$fixedApkName"
    if ($LASTEXITCODE -ne 0) { throw "Failed to upload $fixedApkName to S3" }

    $directUrl = "https://s3.$Region.amazonaws.com/$Bucket/$s3TargetPrefix/$fixedApkName"

    Write-Host "[S3 SUCCESS] Uploaded $fixedApkName" -ForegroundColor Green
    Write-Host "             Direct Permanent Download URL: $directUrl" -ForegroundColor Cyan

    # Upload subfolder version.json (keeps track of latest release version & code for app)
    $subMetadata = @{
        app = $AppLabel
        version = $version
        versionCode = $code
        sizeMB = $apkSizeMB
        updatedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        downloadUrl = $directUrl
    }
    $localSubJson = Join-Path $appArtifactsDir "version.json"
    $subMetadata | ConvertTo-Json -Depth 4 | Set-Content -Path $localSubJson -Encoding utf8
    aws s3 cp "$localSubJson" "s3://$Bucket/$s3TargetPrefix/version.json" | Out-Null

    return @{
        App = $AppLabel
        SubFolder = $SubFolder
        Version = $version
        Code = $code
        DownloadUrl = $directUrl
        SizeMB = $apkSizeMB
    }
}

$deployResults = @{}

# Build UI (Buyer App) -> s3://s3.shivomverma.in/apps/buyer/
if ($App -eq "both" -or $App -eq "ui" -or $App -eq "buyer") {
    $uiDir = Join-Path $WorkspaceRoot "UI"
    $deployResults["buyer"] = Build-And-Upload -AppKey "ui" -AppLabel "RS Buyer App (Shopkeeper)" -AppDir $uiDir -ApkPrefix "rs-buyer" -SubFolder "buyer"
}

# Build ADMIN_APP (Admin App) -> s3://s3.shivomverma.in/apps/admin/
if ($App -eq "both" -or $App -eq "admin") {
    $adminDir = Join-Path $WorkspaceRoot "ADMIN_APP"
    $deployResults["admin"] = Build-And-Upload -AppKey "admin" -AppLabel "RS Admin App" -AppDir $adminDir -ApkPrefix "rs-admin" -SubFolder "admin"
}

# Upload Master metadata version.json to s3://s3.shivomverma.in/apps/version.json
$versionMetadata = @{
    updatedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    bucket = $Bucket
    region = $Region
}

foreach ($key in $deployResults.Keys) {
    $item = $deployResults[$key]
    $versionMetadata[$key] = @{
        name = $item.App
        folder = $item.SubFolder
        version = $item.Version
        versionCode = $item.Code
        sizeMB = $item.SizeMB
        downloadUrl = $item.DownloadUrl
    }
}

$localVersionJson = Join-Path $ArtifactsDir "version.json"
$versionMetadata | ConvertTo-Json -Depth 4 | Set-Content -Path $localVersionJson -Encoding utf8
aws s3 cp "$localVersionJson" "s3://$Bucket/$S3BasePrefix/version.json" | Out-Null

$masterMetaUrl = "https://s3.$Region.amazonaws.com/$Bucket/$S3BasePrefix/version.json"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host " ALL APPS DEPLOYED SUCCESSFULLY TO S3!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Master Metadata: $masterMetaUrl" -ForegroundColor Yellow

foreach ($key in $deployResults.Keys) {
    $item = $deployResults[$key]
    Write-Host "`n[$($item.SubFolder.ToUpper())] $($item.App):" -ForegroundColor Cyan
    Write-Host "  - Version:      v$($item.Version) (Code: $($item.Code))" -ForegroundColor White
    Write-Host "  - File Size:    $($item.SizeMB) MB" -ForegroundColor White
    Write-Host "  - Download URL: $($item.DownloadUrl)" -ForegroundColor Green
}
Write-Host "`n"
