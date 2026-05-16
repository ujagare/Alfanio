#!/usr/bin/env python3
"""
SEO Fix Script - Terminal se run karein
Fixes: fix1 (Canonical), fix6 (Image Compression), fix10 (Google Business Profile Guide)
+ Browser mein SEO Report open karna
"""

import os
import sys
import glob
import json
import shutil
import webbrowser
import subprocess
from pathlib import Path

# ─── Color codes for terminal output ───────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

def print_header(title):
    print(f"\n{BOLD}{CYAN}{'='*60}{RESET}")
    print(f"{BOLD}{CYAN}  {title}{RESET}")
    print(f"{BOLD}{CYAN}{'='*60}{RESET}\n")

def print_success(msg): print(f"  {GREEN}✅ {msg}{RESET}")
def print_error(msg):   print(f"  {RED}❌ {msg}{RESET}")
def print_info(msg):    print(f"  {YELLOW}ℹ️  {msg}{RESET}")
def print_step(msg):    print(f"  {BOLD}→ {msg}{RESET}")


# ══════════════════════════════════════════════════════════════════════════════
# STEP 0 — SEO Report Browser mein Open karo
# ══════════════════════════════════════════════════════════════════════════════
def open_seo_report():
    print_header("STEP 0 — SEO Report Browser mein Open karo")

    # Common paths where report ho sakta hai
    search_paths = [
        "seo_report_v2.html",
        "./seo_report_v2.html",
        os.path.expanduser("~/Desktop/seo_report_v2.html"),
        os.path.expanduser("~/Downloads/seo_report_v2.html"),
    ]
    # Current dir mein bhi dhundho
    search_paths += glob.glob("**/seo_report_v2.html", recursive=True)

    found = None
    for p in search_paths:
        if os.path.isfile(p):
            found = os.path.abspath(p)
            break

    if found:
        url = f"file://{found}"
        print_step(f"Found: {found}")
        webbrowser.open(url)
        print_success(f"Browser mein open kar diya: {url}")
    else:
        print_error("seo_report_v2.html nahi mila.")
        print_info("Manually karo: browser mein Ctrl+O dabao aur file select karo.")
        print_info("Ya is script ko usi folder mein rakh do jahan HTML file hai.")


# ══════════════════════════════════════════════════════════════════════════════
# FIX 6 — Image Compression (BIGGEST IMPACT)
# ══════════════════════════════════════════════════════════════════════════════
def fix6_compress_images():
    print_header("FIX 6 — Image Compression (BIGGEST IMPACT)")

    # Pillow check/install
    try:
        from PIL import Image
        print_success("Pillow library available hai.")
    except ImportError:
        print_step("Pillow install ho raha hai...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "-q"])
        from PIL import Image

    # User se folder lo
    folder = input(f"\n  {YELLOW}Images ka folder path enter karo (Enter = current directory): {RESET}").strip()
    if not folder:
        folder = "."
    folder = Path(folder)

    if not folder.exists():
        print_error(f"Folder nahi mila: {folder}")
        return

    # Supported formats
    exts = ["*.jpg", "*.jpeg", "*.png", "*.webp", "*.bmp", "*.tiff"]
    images = []
    for ext in exts:
        images += list(folder.rglob(ext))

    if not images:
        print_error("Koi image nahi mili is folder mein.")
        return

    print_info(f"{len(images)} images mili hain. Compression shuru...")

    # Output folder
    out_folder = folder / "compressed_images"
    out_folder.mkdir(exist_ok=True)

    total_before = 0
    total_after  = 0
    converted    = 0

    for img_path in images:
        try:
            from PIL import Image
            orig_size = img_path.stat().st_size
            total_before += orig_size

            img = Image.open(img_path).convert("RGB")

            # Max dimension 1920px (responsive web)
            max_dim = 1920
            w, h = img.size
            if max(w, h) > max_dim:
                ratio = max_dim / max(w, h)
                img = img.resize((int(w*ratio), int(h*ratio)), Image.LANCZOS)

            # WebP mein save karo (best compression)
            out_name = out_folder / (img_path.stem + ".webp")
            img.save(out_name, "WEBP", quality=82, method=6)

            new_size = out_name.stat().st_size
            total_after += new_size
            saving = (1 - new_size/orig_size) * 100
            converted += 1

            print_success(f"{img_path.name:40s} → {saving:5.1f}% smaller → {out_name.name}")

        except Exception as e:
            print_error(f"{img_path.name}: {e}")

    # Summary
    saved_mb = (total_before - total_after) / (1024*1024)
    pct = (1 - total_after/total_before)*100 if total_before else 0
    print(f"\n  {BOLD}{GREEN}━━━ COMPRESSION SUMMARY ━━━{RESET}")
    print_success(f"{converted} images compress hui")
    print_success(f"Total saving: {saved_mb:.2f} MB ({pct:.1f}% reduction)")
    print_success(f"Output folder: {out_folder.resolve()}")
    print_info("Ab apni website ke <img> tags mein .webp files use karo.")
    print_info("HTML example:  <img src='compressed_images/photo.webp' loading='lazy' alt='...' />")


# ══════════════════════════════════════════════════════════════════════════════
# FIX 1 — Canonical Tags Fix (CRITICAL)
# ══════════════════════════════════════════════════════════════════════════════
def fix1_canonical():
    print_header("FIX 1 — Canonical Tags Fix (CRITICAL)")

    print_info("Canonical tag Google ko batata hai ki page ka 'main' URL kaunsa hai.")
    print_info("Duplicate content penalty se bachata hai.\n")

    base_url = input(f"  {YELLOW}Apni website ka base URL enter karo (e.g. https://example.com): {RESET}").strip().rstrip("/")
    if not base_url.startswith("http"):
        base_url = "https://" + base_url

    # HTML files dhundho
    folder = input(f"  {YELLOW}HTML files ka folder (Enter = current dir): {RESET}").strip() or "."
    html_files = list(Path(folder).rglob("*.html"))

    if not html_files:
        print_error("Koi .html file nahi mili.")
        # Phir bhi sample dikhao
    else:
        print_info(f"{len(html_files)} HTML files mili hain. Processing...\n")

    fixed = 0
    for html_file in html_files:
        content = html_file.read_text(encoding="utf-8", errors="ignore")

        # Relative path from folder
        rel = html_file.relative_to(folder)
        # URL banana
        parts = list(rel.parts)
        if parts[-1] == "index.html":
            parts = parts[:-1]
        page_url = base_url + "/" + "/".join(parts)
        if page_url == base_url + "/":
            page_url = base_url + "/"

        canonical_tag = f'<link rel="canonical" href="{page_url}" />'

        # Pehle se hai?
        if 'rel="canonical"' in content or "rel='canonical'" in content:
            # Replace karo
            import re
            new_content = re.sub(
                r'<link\s+rel=["\']canonical["\'][^>]*/?>',
                canonical_tag,
                content
            )
            action = "Updated"
        else:
            # <head> ke baad insert karo
            new_content = content.replace("<head>", f"<head>\n    {canonical_tag}", 1)
            if new_content == content:
                new_content = content.replace("<HEAD>", f"<HEAD>\n    {canonical_tag}", 1)
            action = "Added"

        if new_content != content:
            html_file.write_text(new_content, encoding="utf-8")
            print_success(f"{action}: {html_file}  →  {page_url}")
            fixed += 1
        else:
            print_info(f"Skip (no <head> found): {html_file}")

    print(f"\n  {BOLD}{GREEN}━━━ CANONICAL SUMMARY ━━━{RESET}")
    print_success(f"{fixed} files mein canonical tag fix hua")

    # Sitemap reminder
    print_info("Next step: robots.txt mein sitemap URL add karo:")
    print(f"\n  {CYAN}  Sitemap: {base_url}/sitemap.xml{RESET}\n")

    # Sample code bhi dikhao
    print(f"  {BOLD}Sample canonical tag:{RESET}")
    print(f"  {CYAN}<link rel=\"canonical\" href=\"{base_url}/your-page/\" />{RESET}")
    print(f"\n  {BOLD}React/Next.js mein:{RESET}")
    print(f"  {CYAN}<Head><link rel=\"canonical\" href=\"{{router.asPath}}\" /></Head>{RESET}")


# ══════════════════════════════════════════════════════════════════════════════
# FIX 10 — Google Business Profile Guide + JSON-LD Schema
# ══════════════════════════════════════════════════════════════════════════════
def fix10_google_business():
    print_header("FIX 10 — Google Business Profile Setup")

    print_info("Google Business Profile local SEO ke liye SABSE ZAROORI hai.\n")

    # Business details lo
    print(f"  {BOLD}Apna business detail enter karo:{RESET}\n")
    name     = input(f"  Business Name: ").strip() or "My Business"
    phone    = input(f"  Phone Number (+91...): ").strip() or "+91-XXXXXXXXXX"
    address  = input(f"  Street Address: ").strip() or "123, Main Street"
    city     = input(f"  City: ").strip() or "Pune"
    state    = input(f"  State: ").strip() or "Maharashtra"
    pincode  = input(f"  Pincode: ").strip() or "411001"
    website  = input(f"  Website URL: ").strip() or "https://example.com"
    category = input(f"  Business Category (e.g. Restaurant, Dental Clinic): ").strip() or "Local Business"
    hours    = input(f"  Working Hours (e.g. Mon-Sat 9AM-6PM): ").strip() or "Mon-Sat 9AM-6PM"

    # JSON-LD Schema banao
    schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": name,
        "telephone": phone,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": address,
            "addressLocality": city,
            "addressRegion": state,
            "postalCode": pincode,
            "addressCountry": "IN"
        },
        "url": website,
        "@id": website,
        "openingHours": hours,
        "priceRange": "₹₹",
        "sameAs": [
            f"https://www.google.com/maps/search/{name.replace(' ', '+')}",
            f"https://www.justdial.com"
        ]
    }

    schema_tag = f"""<!-- Google Business / LocalBusiness Schema (fix10) -->
<script type="application/ld+json">
{json.dumps(schema, indent=2, ensure_ascii=False)}
</script>"""

    # File save karo
    out = Path("gbp_schema.html")
    out.write_text(schema_tag, encoding="utf-8")
    print_success(f"Schema file bani: {out.resolve()}")

    # Step-by-step guide
    print(f"\n  {BOLD}{GREEN}━━━ GOOGLE BUSINESS PROFILE — STEP BY STEP ━━━{RESET}")
    steps = [
        ("1", "https://business.google.com par jao", "browser mein open karo"),
        ("2", "Sign In karo", "apna Google account use karo"),
        ("3", "'Add your business' click karo", "ya 'Manage now'"),
        ("4", "Business name enter karo", f"exactly: '{name}'"),
        ("5", "Category choose karo", f"'{category}'"),
        ("6", "Address add karo", f"{address}, {city} - {pincode}"),
        ("7", "Phone number add karo", phone),
        ("8", "Website add karo", website),
        ("9", "Verify karo", "postcard by mail (5-7 din) ya phone OTP"),
        ("10","Photos upload karo", "minimum 10 photos (interior, exterior, products)"),
        ("11","Schema tag website mein add karo", "gbp_schema.html file ki content ko <head> mein daalo"),
    ]
    for num, action, detail in steps:
        print(f"  {CYAN}[{num:>2}]{RESET} {BOLD}{action}{RESET}")
        print(f"       {YELLOW}{detail}{RESET}\n")

    print_success("gbp_schema.html ko apni website ke <head> mein add karo!")
    print_info("Google Search Console mein bhi property add karo: https://search.google.com/search-console")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN MENU
# ══════════════════════════════════════════════════════════════════════════════
def main():
    print(f"\n{BOLD}{CYAN}{'█'*60}")
    print("█{'SEO FIX SCRIPT — Terminal Edition':^58}█")
    print(f"{'█'*60}{RESET}")
    print(f"\n  {YELLOW}Kya fix karna chahte ho?{RESET}\n")
    print(f"  {BOLD}[0]{RESET} SEO Report browser mein open karo")
    print(f"  {BOLD}[1]{RESET} Canonical fix karo (fix1) — CRITICAL")
    print(f"  {BOLD}[6]{RESET} Images compress karo (fix6) — BIGGEST IMPACT")
    print(f"  {BOLD}[10]{RESET} Google Business Profile setup (fix10)")
    print(f"  {BOLD}[A]{RESET} Sab kuch ek saath (recommended)")
    print(f"  {BOLD}[Q]{RESET} Quit\n")

    choice = input(f"  {YELLOW}Choice enter karo [0/1/6/10/A/Q]: {RESET}").strip().upper()

    if choice == "0":
        open_seo_report()
    elif choice == "1":
        fix1_canonical()
    elif choice == "6":
        fix6_compress_images()
    elif choice == "10":
        fix10_google_business()
    elif choice == "A":
        open_seo_report()
        fix6_compress_images()
        fix1_canonical()
        fix10_google_business()
        print_header("🎉 SAARI FIXES COMPLETE!")
        print_success("fix1 (Canonical) — Done")
        print_success("fix6 (Image Compression) — Done")
        print_success("fix10 (Google Business Profile) — Done")
        print_info("Ab apni website redeploy karo aur Google Search Console mein inspect karo.")
    elif choice == "Q":
        print(f"\n  {CYAN}Goodbye! SEO fix karte raho! 💪{RESET}\n")
        sys.exit(0)
    else:
        print_error("Invalid choice. Script dobara run karo.")

    print(f"\n  {CYAN}Script complete. Koi aur fix chahiye toh dobara run karo.{RESET}\n")

if __name__ == "__main__":
    main()
