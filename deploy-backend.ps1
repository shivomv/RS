# ==============================================================================
# RS Backend One-Click Automated Deployment Script
# Targets: Docker on Ubuntu EC2 (65.1.3.250)
# ==============================================================================

param (
    [string]$ServerIp = "65.1.3.250",
    [string]$SshUser = "ubuntu",
    [string]$KeyPath = "D:\.secrets\shivomec2.pem",
    [string]$RemoteDir = "/opt/RS/backend"
)

$ErrorActionPreference = "Stop"

Write-Host "`n>>> [1/6] Starting RS Backend Deployment to $ServerIp..." -ForegroundColor Cyan

# 1. Validate SSH Key
if (-not (Test-Path $KeyPath)) {
    Write-Error "SSH key not found at $KeyPath. Please verify the path."
    exit 1
}

# Ensure correct key permissions for OpenSSH on Windows
Write-Host ">>> [2/6] Verifying SSH key permissions..." -ForegroundColor Yellow
try {
    icacls $KeyPath /inheritance:r /grant:r "$($env:USERNAME):(R)" | Out-Null
} catch {
    Write-Warning "Could not reset key permissions with icacls; proceeding anyway..."
}

# 2. Package current local backend (excluding node_modules)
$WorkspaceRoot = $PSScriptRoot
$BackendDir = Join-Path $WorkspaceRoot "backend"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ArchiveName = "backend-deploy-$Timestamp.tar.gz"
$LocalArchive = Join-Path $WorkspaceRoot $ArchiveName

Write-Host ">>> [3/6] Archiving local backend files (excluding node_modules and data)..." -ForegroundColor Yellow
if (-not (Test-Path $BackendDir)) {
    Write-Error "Backend directory $BackendDir not found."
    exit 1
}

# EXCLUDE local dev database so production database is NEVER wiped or overwritten
tar.exe -czf $LocalArchive -C $BackendDir --exclude=node_modules --exclude=data --exclude="*.sqlite*" .

if (-not (Test-Path $LocalArchive)) {
    Write-Error "Failed to create archive $LocalArchive."
    exit 1
}

$ArchiveSize = (Get-Item $LocalArchive).Length / 1KB
Write-Host "    Archive created: $ArchiveName ($([math]::Round($ArchiveSize, 1)) KB)" -ForegroundColor Green
Write-Host "    [SAFEGUARD] Local database (data/database.sqlite) is excluded. Production DB preserved." -ForegroundColor Cyan

# 3. Transfer archive to remote EC2 server
Write-Host ">>> [4/6] Uploading backend bundle to ${ServerIp}:/tmp/$ArchiveName..." -ForegroundColor Yellow
$RemoteTmpArchive = "/tmp/$ArchiveName"

scp -i $KeyPath -o StrictHostKeyChecking=no $LocalArchive "${SshUser}@${ServerIp}:${RemoteTmpArchive}"
if ($LASTEXITCODE -ne 0) {
    Remove-Item $LocalArchive -Force -ErrorAction SilentlyContinue
    Write-Error "SCP upload failed."
    exit 1
}

# Clean up local archive
Remove-Item $LocalArchive -Force -ErrorAction SilentlyContinue

# 4. Remote Deployment Commands
Write-Host ">>> [5/6] Deploying on server: unpacking, rebuilding Docker container, and restarting..." -ForegroundColor Yellow

$RemoteCommands = @(
    "set -e",
    "sudo mkdir -p $RemoteDir",
    "sudo chown -R $SshUser`:$SshUser /opt/RS",
    "tar -xzf $RemoteTmpArchive -C $RemoteDir",
    "rm -f $RemoteTmpArchive",
    "mkdir -p $RemoteDir/data",
    "chmod -R 777 $RemoteDir/data",
    "cd $RemoteDir",
    "sudo docker compose down --remove-orphans || true",
    "sudo docker compose up -d --build",
    "sleep 6",
    "sudo docker ps -f name=rs-backend",
    "curl -I http://127.0.0.1:5000/api/products"
) -join "`n"

ssh -i $KeyPath -o StrictHostKeyChecking=no "${SshUser}@${ServerIp}" $RemoteCommands

if ($LASTEXITCODE -ne 0) {
    Write-Error "Remote deployment commands encountered an error."
    exit 1
}

# 5. Public Health Verification
Write-Host "`n>>> [6/6] Verifying public endpoint (https://api.prabhat708.in)..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

try {
    $res = Invoke-RestMethod -Uri "https://api.prabhat708.in/api/products" -Method Get -TimeoutSec 10
    $count = if ($res -is [array]) { $res.Count } else { ($res.products | Measure-Object).Count }
    Write-Host "[SUCCESS] Public API Verified! Response received ($count items returned)." -ForegroundColor Green
    Write-Host "[SUCCESS] Deployment completed successfully!`n" -ForegroundColor Green
} catch {
    Write-Warning "Public verification response: $($_.Exception.Message). Check server logs with:"
    Write-Host "ssh -i `"$KeyPath`" $SshUser@$ServerIp `"sudo docker logs --tail 50 rs-backend`"" -ForegroundColor Yellow
}
