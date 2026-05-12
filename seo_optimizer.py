#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║           COMPLETE WEBSITE SEO OPTIMIZER SCRIPT                  ║
║  ✅ Images → WebP Convert karna                                   ║
║  ✅ Images pe Alt Tags Add karna                                  ║
║  ✅ Semantic HTML Tags Add karna                                  ║
║  ✅ Schema Markup Add karna (JSON-LD)                             ║
║  ✅ sitemap.xml Generate karna                                    ║
║  ✅ robots.txt Generate karna                                     ║
╚══════════════════════════════════════════════════════════════════╝

INSTALL DEPENDENCIES:
    pip install beautifulsoup4 Pillow lxml

USAGE:
    python seo_optimizer.py

Pehle script ke andar CONFIG section update karein apni website details ke saath.
"""

import os
import re
import sys
import json
import shutil
import urllib.parse
from pathlib import Path
from datetime import datetime, timezone

# ─────────────────────────────────────────────────────────────────
#  ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗
# ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝
# ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗
# ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║
# ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝
#  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝
# ─────────────────────────────────────────────────────────────────

CONFIG = {
    # ── ZARURI: Ye sab apni website ke hisaab se bharo ──────────────
    "WEBSITE_FOLDER": ".",          # Apne website ka folder path
    "BASE_URL": "https://www.alfanio.com",  # Apni website ka URL (trailing slash mat lagao)
    "WEBSITE_NAME": "Alfanio",           # Website ka naam
    "WEBSITE_DESCRIPTION": "Best website for all your needs",  # Website description
    "LANGUAGE": "hi",                       # hi = Hindi, en = English

    # ── Schema Settings ─────────────────────────────────────────────
    "SCHEMA_TYPE": "WebSite",              # WebSite / LocalBusiness / Organization
    "BUSINESS_NAME": "My Business",        # Agar LocalBusiness hai to naam
    "BUSINESS_PHONE": "+91-XXXXXXXXXX",    # Phone number
    "BUSINESS_ADDRESS": "Mumbai, Maharashtra, India",  # Address
    "LOGO_URL": "/images/logo.png",        # Logo ki path

    # ── Image Settings ───────────────────────────────────────────────
    "WEBP_QUALITY": 85,                    # WebP quality (1-100, 85 recommended)
    "CONVERT_TO_WEBP": True,               # WebP conversion ON/OFF
    "ADD_ALT_TAGS": True,                  # Alt tag addition ON/OFF

    # ── Sitemap Settings ─────────────────────────────────────────────
    "SITEMAP_CHANGE_FREQ": "monthly",      # always/hourly/daily/weekly/monthly/yearly
    "SITEMAP_PRIORITY": {
        "index.html": "1.0",
        "default": "0.8",
    },

    # ── robots.txt Settings ──────────────────────────────────────────
    "DISALLOW_PATHS": ["/admin/", "/private/", "/tmp/"],

    # ── Backup ────────────────────────────────────────────────────────
    "CREATE_BACKUP": True,                  # Pehle backup banao original files ka
}

# ─────────────────────────────────────────────────────────────────
# DEPENDENCIES CHECK
# ─────────────────────────────────────────────────────────────────
def check_dependencies():
    missing = []
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        missing.append("beautifulsoup4")
    try:
        from PIL import Image
    except ImportError:
        missing.append("Pillow")
    try:
        import lxml
    except ImportError:
        missing.append("lxml")

    if missing:
        print(f"\n❌ Missing libraries: {', '.join(missing)}")
        print(f"   Install karein: pip install {' '.join(missing)}\n")
        sys.exit(1)
    print("✅ Sab dependencies available hain\n")

check_dependencies()

from bs4 import BeautifulSoup
from PIL import Image

# ─────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────
WEBSITE_PATH = Path(CONFIG["WEBSITE_FOLDER"]).resolve()

SUPPORTED_IMG_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff"}

STATS = {
    "html_files": 0,
    "images_converted": 0,
    "alt_tags_added": 0,
    "semantic_tags_added": 0,
    "schema_added": 0,
}

def log(emoji, msg):
    print(f"  {emoji}  {msg}")

def make_alt_from_filename(filename):
    """Filename se readable alt text banao"""
    name = Path(filename).stem
    name = re.sub(r'[-_]+', ' ', name)
    name = re.sub(r'\d+', '', name).strip()
    name = name.title()
    return name if name else "Image"

def get_relative_url(file_path):
    """File path se relative URL banao"""
    rel = file_path.relative_to(WEBSITE_PATH)
    parts = list(rel.parts)
    if parts[-1] == "index.html":
        parts[-1] = ""
    url = "/" + "/".join(parts)
    return url.rstrip("/") or "/"

def read_html(file_path):
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def write_html(file_path, content):
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

# ─────────────────────────────────────────────────────────────────
# STEP 1: BACKUP
# ─────────────────────────────────────────────────────────────────
def create_backup():
    if not CONFIG["CREATE_BACKUP"]:
        return
    backup_path = str(WEBSITE_PATH) + "_BACKUP_" + datetime.now().strftime("%Y%m%d_%H%M%S")
    shutil.copytree(WEBSITE_PATH, backup_path)
    log("💾", f"Backup banaya: {backup_path}")

# ─────────────────────────────────────────────────────────────────
# STEP 2: IMAGE → WebP CONVERSION
# ─────────────────────────────────────────────────────────────────
def convert_images_to_webp():
    if not CONFIG["CONVERT_TO_WEBP"]:
        log("⏭️", "WebP conversion skip kiya (CONFIG me OFF hai)")
        return {}

    log("🖼️", "Images ko WebP format me convert kar raha hoon...")
    converted_map = {}  # old_path → new_path (relative to website)

    for img_path in WEBSITE_PATH.rglob("*"):
        if img_path.suffix.lower() not in SUPPORTED_IMG_EXTENSIONS:
            continue
        try:
            webp_path = img_path.with_suffix(".webp")
            with Image.open(img_path) as img:
                # RGBA preserve karo (transparency ke liye)
                if img.mode in ("RGBA", "LA"):
                    img.save(webp_path, "WEBP", quality=CONFIG["WEBP_QUALITY"], lossless=False)
                else:
                    img.convert("RGB").save(webp_path, "WEBP", quality=CONFIG["WEBP_QUALITY"])

            # HTML me reference update karne ke liye map banao
            old_rel = str(img_path.relative_to(WEBSITE_PATH)).replace("\\", "/")
            new_rel = str(webp_path.relative_to(WEBSITE_PATH)).replace("\\", "/")
            converted_map[old_rel] = new_rel
            converted_map[img_path.name] = webp_path.name  # filename only bhi store karo

            STATS["images_converted"] += 1
            log("✅", f"Converted: {img_path.name} → {webp_path.name}")
        except Exception as e:
            log("⚠️", f"Convert nahi hua {img_path.name}: {e}")

    log("📊", f"Total {STATS['images_converted']} images WebP me convert huye\n")
    return converted_map

# ─────────────────────────────────────────────────────────────────
# STEP 3: HTML FILES ME CHANGES (alt tags, semantic, schema, webp refs)
# ─────────────────────────────────────────────────────────────────
def update_html_image_references(soup, converted_map):
    """HTML me purani image extensions ko .webp se replace karo"""
    changed = False
    for tag in soup.find_all(["img", "source"]):
        for attr in ["src", "srcset", "data-src"]:
            val = tag.get(attr, "")
            if not val:
                continue
            for old, new in converted_map.items():
                if old in val:
                    tag[attr] = val.replace(old, new)
                    changed = True
    # CSS background images (inline style)
    for tag in soup.find_all(style=True):
        style = tag["style"]
        for old, new in converted_map.items():
            if old in style:
                tag["style"] = style.replace(old, new)
                changed = True
    return changed

def add_alt_tags(soup):
    """Alt tag missing hone par add karo"""
    if not CONFIG["ADD_ALT_TAGS"]:
        return 0
    count = 0
    for img in soup.find_all("img"):
        if not img.get("alt"):
            src = img.get("src", "")
            alt_text = make_alt_from_filename(src) if src else "Image"
            img["alt"] = alt_text
            # loading="lazy" bhi add karo performance ke liye
            if not img.get("loading"):
                img["loading"] = "lazy"
            count += 1
    return count

def add_semantic_tags(soup, file_path):
    """
    Semantic HTML structure add karo jahan missing ho:
    <header>, <main>, <footer>, <nav>, <article>, <section>
    """
    added = 0
    body = soup.find("body")
    if not body:
        return 0

    # ── <header> add karo ──────────────────────────────────────────
    if not soup.find("header"):
        # Pehle div jisme logo/nav ho use header banao
        for div in body.find_all("div", recursive=False):
            classes = " ".join(div.get("class", []))
            if any(kw in classes.lower() for kw in ["header", "navbar", "nav", "top", "logo"]):
                div.name = "header"
                added += 1
                break
        else:
            # Pehle h1 ke parent ko header banao
            h1 = body.find("h1")
            if h1 and h1.parent and h1.parent.name == "div":
                h1.parent.name = "header"
                added += 1

    # ── <nav> add karo ─────────────────────────────────────────────
    if not soup.find("nav"):
        for div in body.find_all("div"):
            classes = " ".join(div.get("class", []))
            if any(kw in classes.lower() for kw in ["nav", "menu", "navigation"]):
                if div.find("ul") or div.find("a"):
                    div.name = "nav"
                    added += 1
                    break

    # ── <main> add karo ────────────────────────────────────────────
    if not soup.find("main"):
        for div in body.find_all("div"):
            classes = " ".join(div.get("class", []))
            if any(kw in classes.lower() for kw in ["main", "content", "container", "wrapper"]):
                div.name = "main"
                added += 1
                break

    # ── <footer> add karo ──────────────────────────────────────────
    if not soup.find("footer"):
        for div in body.find_all("div"):
            classes = " ".join(div.get("class", []))
            if any(kw in classes.lower() for kw in ["footer", "bottom", "foot"]):
                div.name = "footer"
                added += 1
                break

    # ── <article> add karo blog/post pages pe ─────────────────────
    if not soup.find("article"):
        for div in body.find_all("div"):
            classes = " ".join(div.get("class", []))
            if any(kw in classes.lower() for kw in ["post", "article", "blog-content", "entry"]):
                div.name = "article"
                added += 1
                break

    # ── <section> add karo major content blocks ko ────────────────
    section_count = len(soup.find_all("section"))
    if section_count == 0:
        converted = 0
        for div in body.find_all("div"):
            classes = " ".join(div.get("class", []))
            if any(kw in classes.lower() for kw in ["section", "block", "row", "segment"]):
                if div.name == "div":  # already converted nahi hai
                    div.name = "section"
                    converted += 1
                    if converted >= 5:  # max 5 sections per page
                        break
        added += converted

    return added

def build_schema_json(file_path, soup):
    """Page ke liye JSON-LD Schema banao"""
    page_url = CONFIG["BASE_URL"] + get_relative_url(file_path)
    title_tag = soup.find("title")
    page_title = title_tag.get_text(strip=True) if title_tag else CONFIG["WEBSITE_NAME"]
    desc_tag = soup.find("meta", attrs={"name": "description"})
    page_desc = desc_tag["content"] if desc_tag and desc_tag.get("content") else CONFIG["WEBSITE_DESCRIPTION"]

    filename = file_path.name.lower()

    # ── WebSite Schema (sirf homepage pe) ─────────────────────────
    schemas = []

    is_home = filename in ("index.html", "index.htm")

    if is_home:
        schemas.append({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": CONFIG["WEBSITE_NAME"],
            "url": CONFIG["BASE_URL"],
            "description": CONFIG["WEBSITE_DESCRIPTION"],
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": CONFIG["BASE_URL"] + "/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
            }
        })

    # ── WebPage Schema (har page pe) ──────────────────────────────
    schemas.append({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": page_title,
        "url": page_url,
        "description": page_desc,
        "inLanguage": CONFIG["LANGUAGE"],
        "isPartOf": {
            "@type": "WebSite",
            "name": CONFIG["WEBSITE_NAME"],
            "url": CONFIG["BASE_URL"]
        }
    })

    # ── LocalBusiness / Organization Schema (homepage pe) ─────────
    if is_home and CONFIG["SCHEMA_TYPE"] in ("LocalBusiness", "Organization"):
        org_schema = {
            "@context": "https://schema.org",
            "@type": CONFIG["SCHEMA_TYPE"],
            "name": CONFIG["BUSINESS_NAME"],
            "url": CONFIG["BASE_URL"],
            "telephone": CONFIG["BUSINESS_PHONE"],
            "address": {
                "@type": "PostalAddress",
                "streetAddress": CONFIG["BUSINESS_ADDRESS"]
            },
            "logo": {
                "@type": "ImageObject",
                "url": CONFIG["BASE_URL"] + CONFIG["LOGO_URL"]
            }
        }
        schemas.append(org_schema)

    # ── BreadcrumbList Schema ──────────────────────────────────────
    if not is_home:
        rel_parts = file_path.relative_to(WEBSITE_PATH).parts
        breadcrumb_items = [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": CONFIG["BASE_URL"] + "/"
            }
        ]
        for i, part in enumerate(rel_parts[:-1], start=2):
            breadcrumb_items.append({
                "@type": "ListItem",
                "position": i,
                "name": part.replace("-", " ").replace("_", " ").title(),
                "item": CONFIG["BASE_URL"] + "/" + "/".join(rel_parts[:i - 1])
            })
        breadcrumb_items.append({
            "@type": "ListItem",
            "position": len(rel_parts) + 1,
            "name": page_title,
            "item": page_url
        })
        schemas.append({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumb_items
        })

    return schemas

def inject_schema(soup, schemas):
    """Schema scripts ko <head> me inject karo"""
    head = soup.find("head")
    if not head:
        head = soup.new_tag("head")
        soup.html.insert(0, head) if soup.html else soup.insert(0, head)

    # Purane schema scripts hata do (duplicate avoid karne ke liye)
    for old in head.find_all("script", attrs={"type": "application/ld+json"}):
        old.decompose()

    for schema in schemas:
        script_tag = soup.new_tag("script", type="application/ld+json")
        script_tag.string = json.dumps(schema, ensure_ascii=False, indent=2)
        head.append(script_tag)

def ensure_meta_charset(soup):
    """charset meta tag ensure karo"""
    head = soup.find("head")
    if head and not soup.find("meta", attrs={"charset": True}):
        meta = soup.new_tag("meta", charset="UTF-8")
        head.insert(0, meta)

def ensure_viewport(soup):
    """viewport meta tag ensure karo (mobile friendly)"""
    head = soup.find("head")
    if head and not soup.find("meta", attrs={"name": "viewport"}):
        meta = soup.new_tag("meta", attrs={
            "name": "viewport",
            "content": "width=device-width, initial-scale=1.0"
        })
        head.append(meta)

def ensure_html_lang(soup):
    """html tag pe lang attribute ensure karo"""
    html_tag = soup.find("html")
    if html_tag and not html_tag.get("lang"):
        html_tag["lang"] = CONFIG["LANGUAGE"]

def process_html_file(file_path, converted_map):
    """Ek HTML file ko process karo — sabhi changes apply karo"""
    content = read_html(file_path)
    soup = BeautifulSoup(content, "lxml")

    # ── Basic meta ───────────────────────────────────────────────
    ensure_html_lang(soup)
    ensure_meta_charset(soup)
    ensure_viewport(soup)

    # ── Image references update karo (WebP) ───────────────────────
    update_html_image_references(soup, converted_map)

    # ── Alt tags add karo ─────────────────────────────────────────
    alt_count = add_alt_tags(soup)
    STATS["alt_tags_added"] += alt_count

    # ── Semantic tags add karo ────────────────────────────────────
    sem_count = add_semantic_tags(soup, file_path)
    STATS["semantic_tags_added"] += sem_count

    # ── Schema inject karo ────────────────────────────────────────
    schemas = build_schema_json(file_path, soup)
    inject_schema(soup, schemas)
    STATS["schema_added"] += 1

    # ── Save karo ─────────────────────────────────────────────────
    write_html(file_path, str(soup))
    STATS["html_files"] += 1

    log("📄", f"{file_path.relative_to(WEBSITE_PATH)} "
               f"[alt+{alt_count} | semantic+{sem_count} | schema✓]")

# ─────────────────────────────────────────────────────────────────
# STEP 4: SITEMAP.XML
# ─────────────────────────────────────────────────────────────────
def generate_sitemap(html_files):
    log("🗺️", "sitemap.xml generate kar raha hoon...")
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    lines.append('        xmlns:xhtml="http://www.w3.org/1999/xhtml">')

    for file_path in sorted(html_files):
        rel_url = get_relative_url(file_path)
        full_url = CONFIG["BASE_URL"] + rel_url
        filename = file_path.name

        priority = CONFIG["SITEMAP_PRIORITY"].get(
            filename, CONFIG["SITEMAP_PRIORITY"]["default"]
        )
        change_freq = CONFIG["SITEMAP_CHANGE_FREQ"]

        lines.append("  <url>")
        lines.append(f"    <loc>{full_url}</loc>")
        lines.append(f"    <lastmod>{now}</lastmod>")
        lines.append(f"    <changefreq>{change_freq}</changefreq>")
        lines.append(f"    <priority>{priority}</priority>")
        lines.append("  </url>")

    lines.append("</urlset>")

    sitemap_path = WEBSITE_PATH / "sitemap.xml"
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    log("✅", f"sitemap.xml banaya ({len(html_files)} URLs ke saath)")

# ─────────────────────────────────────────────────────────────────
# STEP 5: ROBOTS.TXT
# ─────────────────────────────────────────────────────────────────
def generate_robots_txt():
    log("🤖", "robots.txt generate kar raha hoon...")

    disallow_lines = "\n".join(
        f"Disallow: {path}" for path in CONFIG["DISALLOW_PATHS"]
    )

    content = f"""# robots.txt — Auto-generated by SEO Optimizer
# Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

User-agent: *
Allow: /
{disallow_lines}

# Sitemap
Sitemap: {CONFIG["BASE_URL"]}/sitemap.xml

# Search Engine Specific
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2
"""
    robots_path = WEBSITE_PATH / "robots.txt"
    with open(robots_path, "w", encoding="utf-8") as f:
        f.write(content)

    log("✅", "robots.txt banaya")

# ─────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────
def main():
    print("\n" + "═" * 60)
    print("   🚀  WEBSITE SEO OPTIMIZER  🚀")
    print("═" * 60)

    # Folder check
    if not WEBSITE_PATH.exists():
        print(f"\n❌ Folder nahi mila: {WEBSITE_PATH}")
        print("   CONFIG me 'WEBSITE_FOLDER' sahi path set karein\n")
        sys.exit(1)

    print(f"\n📂 Website Folder : {WEBSITE_PATH}")
    print(f"🌐 Base URL       : {CONFIG['BASE_URL']}\n")

    # ── Backup ───────────────────────────────────────────────────
    print("─" * 60)
    print("💾  STEP 1: BACKUP")
    print("─" * 60)
    create_backup()

    # ── WebP Conversion ──────────────────────────────────────────
    print("\n" + "─" * 60)
    print("🖼️   STEP 2: IMAGE → WebP CONVERSION")
    print("─" * 60)
    converted_map = convert_images_to_webp()

    # ── HTML Files Find karo ──────────────────────────────────────
    html_files = list(WEBSITE_PATH.rglob("*.html")) + list(WEBSITE_PATH.rglob("*.htm"))
    # Backup folder exclude karo
    html_files = [
        f for f in html_files
        if "_BACKUP_" not in str(f)
    ]

    if not html_files:
        print("\n⚠️  Koi HTML file nahi mili! Folder path check karein.")
        sys.exit(1)

    # ── Process HTML ─────────────────────────────────────────────
    print("\n" + "─" * 60)
    print("📄  STEP 3: HTML FILES PROCESS (alt, semantic, schema)")
    print("─" * 60)
    for file_path in html_files:
        try:
            process_html_file(file_path, converted_map)
        except Exception as e:
            log("❌", f"Error in {file_path.name}: {e}")

    # ── Sitemap ──────────────────────────────────────────────────
    print("\n" + "─" * 60)
    print("🗺️   STEP 4: SITEMAP.XML")
    print("─" * 60)
    generate_sitemap(html_files)

    # ── robots.txt ───────────────────────────────────────────────
    print("\n" + "─" * 60)
    print("🤖  STEP 5: ROBOTS.TXT")
    print("─" * 60)
    generate_robots_txt()

    # ── Final Report ─────────────────────────────────────────────
    print("\n" + "═" * 60)
    print("   ✅  OPTIMIZATION COMPLETE — FINAL REPORT")
    print("═" * 60)
    print(f"  📄 HTML Pages Processed  : {STATS['html_files']}")
    print(f"  🖼️  Images WebP Converted  : {STATS['images_converted']}")
    print(f"  🏷️  Alt Tags Added         : {STATS['alt_tags_added']}")
    print(f"  🏗️  Semantic Tags Added    : {STATS['semantic_tags_added']}")
    print(f"  📋 Schema Injected        : {STATS['schema_added']} pages")
    print(f"  🗺️  sitemap.xml            : ✅ Created")
    print(f"  🤖 robots.txt             : ✅ Created")
    print("═" * 60)
    print("\n🎉 Sab kuch ho gaya! Ab apni website Google Search Console me")
    print("   sitemap.xml submit kar sakte ho.\n")


if __name__ == "__main__":
    main()
