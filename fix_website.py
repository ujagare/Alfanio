#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║         ALFANIO WEBSITE — AUTO FIX SCRIPT                        ║
║  Fix 1: index.html domain alfanio.com → alfanio.in               ║
║  Fix 2: CSS mein /assets/Alfanio.png path resolve                 ║
║  Fix 3: ImageLoader.jsx case-sensitive import fix                 ║
║  Fix 4: API config unify karna                                    ║
║  Fix 5: products.js mein /n typo fix                              ║
║  Fix 6: Images compress karna (1MB+ ko optimize)                  ║
║  Fix 7: Vite config empty chunks warning fix                      ║
║  Fix 8: Production se console.log remove karna                    ║
╚══════════════════════════════════════════════════════════════════╝

USAGE:
    python fix_website.py

Pehle script ke andar ROOT_DIR sahi set karein.
"""

import os
import re
import sys
import shutil
from pathlib import Path
from datetime import datetime

# ─────────────────────────────────────────────────────────────────
# CONFIG — apna folder path yahan set karo
# ─────────────────────────────────────────────────────────────────
ROOT_DIR = Path(".")   # Current folder (jahan se script chala rahe ho)
CREATE_BACKUP = True   # Backup ON rakho hamesha

# ─────────────────────────────────────────────────────────────────
STATS = {}

def log_fix(num, msg):
    print(f"\n  ✅ FIX {num}: {msg}")

def log_skip(num, msg):
    print(f"\n  ⏭️  FIX {num} SKIP: {msg}")

def log_warn(msg):
    print(f"  ⚠️   {msg}")

def log_info(msg):
    print(f"      → {msg}")

def read_file(path):
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        log_warn(f"Read error {path}: {e}")
        return None

def write_file(path, content):
    try:
        path.write_text(content, encoding="utf-8")
        return True
    except Exception as e:
        log_warn(f"Write error {path}: {e}")
        return False

def find_file(name, search_in=None):
    """File dhundo by name"""
    base = search_in or ROOT_DIR
    results = list(base.rglob(name))
    results = [r for r in results if "_BACKUP_" not in str(r) and "node_modules" not in str(r)]
    return results[0] if results else None

def find_files_by_pattern(pattern, search_in=None):
    """Glob pattern se multiple files dhundo"""
    base = search_in or ROOT_DIR
    results = list(base.rglob(pattern))
    return [r for r in results if "_BACKUP_" not in str(r) and "node_modules" not in str(r)]

# ─────────────────────────────────────────────────────────────────
# BACKUP
# ─────────────────────────────────────────────────────────────────
def create_backup():
    if not CREATE_BACKUP:
        return
    backup_path = str(ROOT_DIR.resolve()) + "_AUTOFIX_BACKUP_" + datetime.now().strftime("%Y%m%d_%H%M%S")
    # Sirf src, public, backend copy karo (node_modules skip)
    excludes = {"node_modules", ".git", "dist", "_BACKUP_"}
    def ignore_func(src, names):
        return [n for n in names if n in excludes or any(e in src for e in excludes)]
    shutil.copytree(ROOT_DIR.resolve(), backup_path, ignore=ignore_func)
    print(f"  💾 Backup banaya: {backup_path}")

# ─────────────────────────────────────────────────────────────────
# FIX 1 — index.html: alfanio.com → alfanio.in
# ─────────────────────────────────────────────────────────────────
def fix1_domain_mismatch():
    print("\n" + "─"*58)
    print("  FIX 1: index.html Domain alfanio.com → alfanio.in")
    print("─"*58)

    index_files = find_files_by_pattern("index.html")
    # Only root-level index.html (not inside dist/node_modules)
    root_index = [f for f in index_files if f.parent == ROOT_DIR or f.parent.name == "public"]

    if not root_index:
        log_skip(1, "index.html nahi mila")
        return

    total_fixed = 0
    for f in root_index:
        content = read_file(f)
        if not content:
            continue
        # alfanio.com replace karo alfanio.in se (case insensitive)
        new_content = re.sub(
            r'https?://(www\.)?alfanio\.com',
            lambda m: m.group(0).replace("alfanio.com", "alfanio.in"),
            content,
            flags=re.IGNORECASE
        )
        # Sirf domain (without http) bhi fix karo
        new_content = re.sub(
            r'\balfanio\.com\b',
            'alfanio.in',
            new_content,
            flags=re.IGNORECASE
        )
        if new_content != content:
            write_file(f, new_content)
            count = content.count("alfanio.com") + content.lower().count("alfanio.com")
            total_fixed += 1
            log_fix(1, f"{f.name} — domain references fix huye")
            log_info(f"File: {f}")
        else:
            log_info(f"{f.name} mein alfanio.com nahi mila (already fixed?)")

    STATS["fix1"] = total_fixed

# ─────────────────────────────────────────────────────────────────
# FIX 2 — index.css: /assets/Alfanio.png path fix
# ─────────────────────────────────────────────────────────────────
def fix2_css_image_path():
    print("\n" + "─"*58)
    print("  FIX 2: CSS mein /assets/Alfanio.png path fix")
    print("─"*58)

    css_files = find_files_by_pattern("*.css")
    css_files += find_files_by_pattern("index.css")
    css_files = list(set(css_files))

    # Alfanio.png actually kahan hai dhundo
    actual_png = find_file("Alfanio.png")
    actual_webp = find_file("Alfanio.webp")

    best_img = actual_webp or actual_png
    if best_img:
        # Relative path from src/assets or public
        img_name = best_img.name
        log_info(f"Image mili: {best_img}")
    else:
        img_name = "Alfanio.png"
        log_warn("Alfanio.png/webp kahi nahi mili — path fix hoga but image upload karna padega")

    fixed = 0
    for css_file in css_files:
        content = read_file(css_file)
        if not content:
            continue
        if "Alfanio.png" not in content and "Alfanio.webp" not in content:
            continue

        # Sahi path determine karo
        # Agar file src/ me hai to relative path use karo
        if "src" in str(css_file):
            correct_path = f"../assets/{img_name}"
        else:
            correct_path = f"/assets/{img_name}"

        new_content = re.sub(
            r'url\(["\']?[^"\'()]*Alfanio\.(png|webp)["\']?\)',
            f'url("{correct_path}")',
            content
        )
        if new_content != content:
            write_file(css_file, new_content)
            fixed += 1
            log_fix(2, f"{css_file.name} — image path fix hua")
            log_info(f"New path: {correct_path}")

    if fixed == 0:
        log_skip(2, "Koi CSS file mein issue nahi mila")

    STATS["fix2"] = fixed

# ─────────────────────────────────────────────────────────────────
# FIX 3 — ImageLoader.jsx: case-sensitive import fix
# ─────────────────────────────────────────────────────────────────
def fix3_case_sensitive_import():
    print("\n" + "─"*58)
    print("  FIX 3: ImageLoader.jsx — case-sensitive import fix")
    print("─"*58)

    target = find_file("ImageLoader.jsx")
    if not target:
        log_skip(3, "ImageLoader.jsx nahi mila")
        return

    content = read_file(target)
    if not content:
        return

    # ../utils/imageUtils → ../Utils/imageUtils (capital U)
    # But pehle check karo actual folder name kya hai
    utils_dir = None
    for candidate in ["Utils", "utils"]:
        p = target.parent.parent / candidate
        if p.exists():
            utils_dir = candidate
            break

    if not utils_dir:
        # Dhundo kahan hai
        for d in ROOT_DIR.rglob("imageUtils*"):
            if "node_modules" not in str(d):
                utils_dir = d.parent.name
                break

    if not utils_dir:
        utils_dir = "utils"  # default

    log_info(f"Actual utils folder naam: '{utils_dir}'")

    # Fix: jo bhi case ho use sahi karo
    new_content = re.sub(
        r'from\s+["\'](\.\./)[Uu]tils/imageUtils["\']',
        f'from "../{utils_dir}/imageUtils"',
        content
    )
    # Same folder ke liye bhi
    new_content = re.sub(
        r'from\s+["\'](\./)[Uu]tils/imageUtils["\']',
        f'from "./{utils_dir}/imageUtils"',
        new_content
    )

    if new_content != content:
        write_file(target, new_content)
        log_fix(3, f"ImageLoader.jsx — import path fix hua → '../{utils_dir}/imageUtils'")
    else:
        log_skip(3, "Import already correct hai ya pattern match nahi hua")

    STATS["fix3"] = 1

# ─────────────────────────────────────────────────────────────────
# FIX 4 — API config unify karna
# ─────────────────────────────────────────────────────────────────
def fix4_api_config():
    print("\n" + "─"*58)
    print("  FIX 4: API Config Unify karna")
    print("─"*58)

    config_file = find_file("config.js")
    api_file    = find_file("api.js")

    if not config_file:
        log_skip(4, "config.js nahi mila")
        return

    config_content = read_file(config_file)

    # config.js mein central BASE_URL define karo
    # Check karo agar already API_URL/BASE_URL hai
    if "BASE_URL" in (config_content or "") or "API_URL" in (config_content or ""):
        log_info("config.js mein BASE_URL already hai")
    else:
        # Add karo end mein
        addition = """
// ── API Configuration (Auto-added by fix script) ──────────────
const BASE_URL = import.meta?.env?.VITE_API_URL
  || (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5001"
      : "https://alfanio.in");

export const API_BASE_URL = BASE_URL;
export const API_ENDPOINTS = {
  contact:   BASE_URL + "/api/contact",
  brochure:  BASE_URL + "/api/brochure",
  products:  BASE_URL + "/api/products",
};
"""
        write_file(config_file, (config_content or "") + addition)
        log_fix(4, "config.js mein unified BASE_URL add kiya")

    # api.js update karo config se import karne ke liye
    if api_file:
        api_content = read_file(api_file) or ""
        if "alfanio.in" in api_content or "localhost:5001" in api_content:
            # Hardcoded URLs replace karo
            new_api = re.sub(
                r'["\']https?://(?:www\.)?alfanio\.in["\']',
                'API_BASE_URL',
                api_content
            )
            new_api = re.sub(
                r'["\']https?://localhost:\d+["\']',
                'API_BASE_URL',
                new_api
            )
            # Import add karo agar nahi hai
            if "API_BASE_URL" in new_api and "import" not in new_api.split("API_BASE_URL")[0][-100:]:
                new_api = 'import { API_BASE_URL } from "./config";\n' + new_api

            if new_api != api_content:
                write_file(api_file, new_api)
                log_fix(4, "api.js — hardcoded URLs → API_BASE_URL se replace kiya")

    STATS["fix4"] = 1

# ─────────────────────────────────────────────────────────────────
# FIX 5 — products.js: \n typo fix
# ─────────────────────────────────────────────────────────────────
def fix5_products_newline_typo():
    print("\n" + "─"*58)
    print("  FIX 5: products.js — /n typo fix")
    print("─"*58)

    products_files = find_files_by_pattern("products.js")
    products_files += find_files_by_pattern("products.ts")
    products_files += find_files_by_pattern("products.jsx")

    fixed = 0
    for f in products_files:
        content = read_file(f)
        if not content or "/n" not in content:
            continue

        # /n → \n (actual newline ka text representation)
        # Context: description strings ke andar /n hai
        # Replace /n with space ya actual newline character
        new_content = content

        # Option 1: /n ko space se replace karo (cleaner UI ke liye)
        new_content = re.sub(r'/n\s*', ' ', new_content)

        # Agar description mein hai to zyada carefully replace karo
        # Strings ke andar /n dhundo
        if new_content != content:
            write_file(f, new_content)
            fixed += 1
            typo_count = content.count("/n")
            log_fix(5, f"{f.name} — {typo_count} '/n' typos fix hue → space se replace kiya")
            log_info(f"File: {f}")

    if fixed == 0:
        log_skip(5, "Koi /n typo nahi mila products files mein")

    STATS["fix5"] = fixed

# ─────────────────────────────────────────────────────────────────
# FIX 6 — Heavy images compress karna
# ─────────────────────────────────────────────────────────────────
def fix6_compress_heavy_images():
    print("\n" + "─"*58)
    print("  FIX 6: Heavy Images Compress karna (1MB+ images)")
    print("─"*58)

    try:
        from PIL import Image as PILImage
    except ImportError:
        log_warn("Pillow install karo: pip install Pillow")
        log_skip(6, "Pillow library missing")
        return

    IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
    SIZE_THRESHOLD = 500 * 1024  # 500KB se badi images compress karo
    MAX_DIMENSION  = 1920        # Max width/height

    compressed = 0
    total_saved = 0

    for img_path in ROOT_DIR.rglob("*"):
        if img_path.suffix.lower() not in IMAGE_EXTS:
            continue
        if "node_modules" in str(img_path) or "_BACKUP_" in str(img_path):
            continue

        size = img_path.stat().st_size
        if size < SIZE_THRESHOLD:
            continue

        try:
            with PILImage.open(img_path) as img:
                orig_size = size
                w, h = img.size

                # Resize karo agar bahut bada hai
                if w > MAX_DIMENSION or h > MAX_DIMENSION:
                    ratio = min(MAX_DIMENSION/w, MAX_DIMENSION/h)
                    new_w, new_h = int(w*ratio), int(h*ratio)
                    img = img.resize((new_w, new_h), PILImage.LANCZOS)
                    log_info(f"Resized: {w}x{h} → {new_w}x{new_h}")

                # WebP mein save karo
                webp_path = img_path.with_suffix(".webp")
                if img.mode in ("RGBA", "LA", "P"):
                    img = img.convert("RGBA")
                    img.save(webp_path, "WEBP", quality=82, method=6)
                else:
                    img.convert("RGB").save(webp_path, "WEBP", quality=82, method=6)

                new_size = webp_path.stat().st_size
                saved = orig_size - new_size
                total_saved += saved
                compressed += 1

                log_info(
                    f"{img_path.name}: "
                    f"{orig_size//1024}KB → {new_size//1024}KB "
                    f"(saved {saved//1024}KB)"
                )

        except Exception as e:
            log_warn(f"Compress nahi hua {img_path.name}: {e}")

    if compressed > 0:
        log_fix(6, f"{compressed} images compress hue | Total saved: {total_saved//1024}KB")
    else:
        log_skip(6, f"Koi image {SIZE_THRESHOLD//1024}KB se badi nahi mili")

    STATS["fix6"] = compressed

# ─────────────────────────────────────────────────────────────────
# FIX 7 — Vite config: empty chunks warning fix
# ─────────────────────────────────────────────────────────────────
def fix7_vite_config():
    print("\n" + "─"*58)
    print("  FIX 7: Vite Config — empty chunks warning fix")
    print("─"*58)

    vite_config = find_file("vite.config.js") or find_file("vite.config.ts")
    if not vite_config:
        log_skip(7, "vite.config.js/ts nahi mila")
        return

    content = read_file(vite_config)
    if not content:
        return

    # Check karo agar already manualChunks hai
    if "manualChunks" in content:
        log_skip(7, "manualChunks already configured hai")
        return

    # Build rollupOptions add karo with proper chunking
    chunk_config = """
    // Auto-added: Empty chunks warning fix + better chunking
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor:  ["react", "react-dom"],
            leaflet: ["leaflet"],
            motion:  ["framer-motion"],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },"""

    # defineConfig ke andar add karo
    if "defineConfig({" in content:
        # Existing config mein add karo
        new_content = content.replace(
            "defineConfig({",
            "defineConfig({" + chunk_config,
            1
        )
    else:
        log_warn("defineConfig pattern nahi mila — manually add karna padega")
        log_info("""Vite config mein ye add karo:
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor:  ["react", "react-dom"],
            leaflet: ["leaflet"],
            motion:  ["framer-motion"],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },""")
        STATS["fix7"] = 0
        return

    if new_content != content:
        write_file(vite_config, new_content)
        log_fix(7, f"{vite_config.name} — manualChunks add kiya (utils/leaflet/motion split)")
    
    STATS["fix7"] = 1

# ─────────────────────────────────────────────────────────────────
# FIX 8 — console.log remove from production JS/JSX/TS
# ─────────────────────────────────────────────────────────────────
def fix8_remove_console_logs():
    print("\n" + "─"*58)
    print("  FIX 8: Production se console.log remove karna")
    print("─"*58)

    JS_EXTS = {".js", ".jsx", ".ts", ".tsx"}
    removed = 0
    files_changed = 0

    # Skip karo: node_modules, dist, test files, config files
    SKIP_FILES = {
        "vite.config.js", "vite.config.ts",
        "jest.config.js", "webpack.config.js",
        ".eslintrc.js", "babel.config.js",
    }

    for f in ROOT_DIR.rglob("*"):
        if f.suffix not in JS_EXTS:
            continue
        if "node_modules" in str(f) or "dist" in str(f) or "_BACKUP_" in str(f):
            continue
        if f.name in SKIP_FILES:
            continue

        content = read_file(f)
        if not content or "console." not in content:
            continue

        # console.log, console.error, console.warn, console.info, console.debug
        # But keep karo: // eslint-disable-line wale
        lines = content.split("\n")
        new_lines = []
        file_removed = 0

        for line in lines:
            # Console statement hai?
            if re.search(r'\bconsole\.(log|error|warn|info|debug|trace)\s*\(', line):
                # Sirf comment nahi hai
                stripped = line.lstrip()
                if not stripped.startswith("//") and not stripped.startswith("*"):
                    # Comment me convert karo (delete nahi, safer hai)
                    new_lines.append("  // " + line.lstrip() + "  // [removed by fix script]")
                    file_removed += 1
                    continue
            new_lines.append(line)

        if file_removed > 0:
            write_file(f, "\n".join(new_lines))
            removed += file_removed
            files_changed += 1
            log_info(f"{f.relative_to(ROOT_DIR)}: {file_removed} console statements comment kiye")

    if removed > 0:
        log_fix(8, f"{removed} console.log statements comment kiye gaye ({files_changed} files mein)")
        log_info("Note: Delete nahi kiya, comment kiya hai — agar chahiye to uncomment kar sako")
    else:
        log_skip(8, "Koi console.log nahi mila (already clean hai)")

    STATS["fix8"] = removed

# ─────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────
def main():
    global ROOT_DIR
    ROOT_DIR = ROOT_DIR.resolve()

    print("\n" + "═"*58)
    print("   🔧  ALFANIO WEBSITE AUTO-FIX SCRIPT  🔧")
    print("═"*58)
    print(f"\n📂 Folder: {ROOT_DIR}")
    print(f"🕐 Time  : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    if not ROOT_DIR.exists():
        print(f"❌ Folder nahi mila: {ROOT_DIR}")
        sys.exit(1)

    # Backup
    print("─"*58)
    print("  💾  BACKUP (pehle sab kuch safe karte hain)")
    print("─"*58)
    create_backup()

    # Sab fixes chalao
    fix1_domain_mismatch()
    fix2_css_image_path()
    fix3_case_sensitive_import()
    fix4_api_config()
    fix5_products_newline_typo()
    fix6_compress_heavy_images()
    fix7_vite_config()
    fix8_remove_console_logs()

    # Final Report
    print("\n\n" + "═"*58)
    print("   ✅  ALL FIXES DONE — FINAL REPORT")
    print("═"*58)
    print(f"  Fix 1 — Domain fix     : {'✅ Done' if STATS.get('fix1') else '⏭️ Skip'}")
    print(f"  Fix 2 — CSS img path   : {'✅ Done' if STATS.get('fix2') else '⏭️ Skip'}")
    print(f"  Fix 3 — Import case    : {'✅ Done' if STATS.get('fix3') else '⏭️ Skip'}")
    print(f"  Fix 4 — API config     : {'✅ Done' if STATS.get('fix4') else '⏭️ Skip'}")
    print(f"  Fix 5 — /n typo        : {'✅ Done' if STATS.get('fix5') else '⏭️ Skip'}")
    print(f"  Fix 6 — Images compress: {STATS.get('fix6', 0)} images compressed")
    print(f"  Fix 7 — Vite config    : {'✅ Done' if STATS.get('fix7') else '⏭️ Skip/Manual'}")
    print(f"  Fix 8 — console.log    : {STATS.get('fix8', 0)} statements removed")
    print("═"*58)
    print("\n📌 Next Steps:")
    print("   1. npm run build  →  check karo koi warning aaya ya nahi")
    print("   2. Test karo locally: npm run dev")
    print("   3. Deploy karo")
    print()


if __name__ == "__main__":
    main()
