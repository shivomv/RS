"""
RS Industries / RS Enterprise - Android App Icon Generator
Transforms raw wide rectangular logo into balanced 1:1 square & round icons across all Android mipmap densities.
"""

import os
from PIL import Image, ImageDraw, ImageFont

def generate_icons(
    source_image_path,
    workspace_root="."
):
    if not os.path.isabs(source_image_path):
        source_image_path = os.path.join(workspace_root, source_image_path)

    if not os.path.exists(source_image_path):
        raise FileNotFoundError(f"Source image not found: {source_image_path}")

    img = Image.open(source_image_path).convert("RGBA")

    # Crop content box
    # If the user provides a raw logo, find non-white content bounds
    rgb = img.convert("RGB")
    import numpy as np
    arr = np.array(rgb)
    non_white = np.any(arr < 250, axis=-1)
    y_indices, x_indices = np.where(non_white)
    top, bottom = y_indices.min(), y_indices.max()
    left, right = x_indices.min(), x_indices.max()
    
    logo = img.crop((left, top, right + 1, bottom + 1))
    lw, lh = logo.size

    # Fit into 1024x1024 canvas with comfortable padding (~72-74% target width)
    target_w = 740
    scale = target_w / lw
    target_h = int(round(lh * scale))
    logo_scaled = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # 1. Base Square Icon (Buyer / Shopkeeper App)
    buyer_square = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
    bx = (1024 - target_w) // 2
    by = (1024 - target_h) // 2
    buyer_square.paste(logo_scaled, (bx, by), logo_scaled)

    # 2. Base Round Icon (Buyer App)
    mask = Image.new("L", (1024, 1024), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.ellipse((0, 0, 1024, 1024), fill=255)
    buyer_round = Image.new("RGBA", (1024, 1024), (255, 255, 255, 0))
    buyer_round.paste(buyer_square, (0, 0), mask)

    # 3. Admin Square Icon (With elegant Navy ADMIN badge pill)
    admin_square = buyer_square.copy()
    draw_admin = ImageDraw.Draw(admin_square)
    badge_w = 300
    badge_h = 68
    ax0 = (1024 - badge_w) // 2
    ay0 = 760
    draw_admin.rounded_rectangle([ax0, ay0, ax0 + badge_w, ay0 + badge_h], radius=34, fill=(0, 45, 98, 255))

    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 40)
    except Exception:
        font = ImageFont.load_default()

    text = "ADMIN"
    bbox = draw_admin.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = ax0 + (badge_w - tw) // 2
    ty = ay0 + (badge_h - th) // 2 - 3
    draw_admin.text((tx, ty), text, fill=(255, 255, 255, 255), font=font)

    # 4. Admin Round Icon
    admin_round = Image.new("RGBA", (1024, 1024), (255, 255, 255, 0))
    admin_round.paste(admin_square, (0, 0), mask)

    # Mipmap specifications
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }

    def write_mipmaps(app_folder, sq_img, rd_img):
        res_dir = os.path.join(workspace_root, app_folder, "android", "app", "src", "main", "res")
        for folder, size in densities.items():
            target_dir = os.path.join(res_dir, folder)
            os.makedirs(target_dir, exist_ok=True)
            sq_img.resize((size, size), Image.Resampling.LANCZOS).save(os.path.join(target_dir, "ic_launcher.png"), "PNG")
            rd_img.resize((size, size), Image.Resampling.LANCZOS).save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")
            print(f"[{app_folder}] Updated {folder} ({size}x{size})")

    write_mipmaps("UI", buyer_square, buyer_round)
    write_mipmaps("ADMIN_APP", admin_square, admin_round)

    # Save high-res master exports
    dist_dir = os.path.join(workspace_root, "dist", "icons")
    os.makedirs(dist_dir, exist_ok=True)
    buyer_square.save(os.path.join(dist_dir, "buyer-icon-1024.png"), "PNG")
    buyer_round.save(os.path.join(dist_dir, "buyer-icon-round-1024.png"), "PNG")
    buyer_square.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(dist_dir, "buyer-icon-512.png"), "PNG")

    admin_square.save(os.path.join(dist_dir, "admin-icon-1024.png"), "PNG")
    admin_round.save(os.path.join(dist_dir, "admin-icon-round-1024.png"), "PNG")
    admin_square.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(dist_dir, "admin-icon-512.png"), "PNG")

    print("\nSuccessfully generated all app icon mipmaps and high-res store assets.")

if __name__ == "__main__":
    import sys
    src = sys.argv[1] if len(sys.argv) > 1 else r"C:/Users/hp/.gemini/antigravity/brain/7b316146-b737-4efc-99fc-a8b6f9d46494/.user_uploaded/media_1792353672688_7abd14b7.png"
    generate_icons(src)
