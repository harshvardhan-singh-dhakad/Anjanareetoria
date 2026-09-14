import os
import zipfile
import stat

src_dir = r"c:\Users\DELL\.gemini\antigravity\scratch\arblessings-nextjs"
output_zip = os.path.join(src_dir, "source-deploy.zip")

INCLUDE_ROOT_FILES = {
    "package.json",
    "package-lock.json",
    "next.config.mjs",
    "tsconfig.json",
    "tailwind.config.ts",
    "postcss.config.mjs",
    ".eslintrc.json",
    "next-env.d.ts",
}

INCLUDE_DIRS = ["src", "public", "private-ebooks"]

if os.path.exists(output_zip):
    os.remove(output_zip)

print(f"Creating clean production source archive: {output_zip}...")
count = 0

with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
    # 1. Add root files
    for fname in INCLUDE_ROOT_FILES:
        fpath = os.path.join(src_dir, fname)
        if os.path.isfile(fpath):
            zinfo = zipfile.ZipInfo.from_file(fpath, fname)
            zinfo.external_attr = (0o644 | stat.S_IFREG) << 16
            with open(fpath, 'rb') as fp:
                zf.writestr(zinfo, fp.read(), compress_type=zipfile.ZIP_DEFLATED)
            count += 1

    # 2. Add directories
    for inc_dir in INCLUDE_DIRS:
        full_dir = os.path.join(src_dir, inc_dir)
        if not os.path.exists(full_dir):
            continue

        for root, dirs, files in os.walk(full_dir):
            rel_root = os.path.relpath(root, src_dir).replace("\\", "/")
            
            # Skip public/videos
            if rel_root.startswith("public/videos"):
                continue

            # Add directory entry with 0755
            zinfo = zipfile.ZipInfo(rel_root + "/")
            zinfo.external_attr = (0o755 | stat.S_IFDIR) << 16
            zf.writestr(zinfo, '')

            for f in files:
                fpath = os.path.join(root, f)
                rel_file = os.path.relpath(fpath, src_dir).replace("\\", "/")
                
                # Skip video files
                if rel_file.startswith("public/videos/"):
                    continue

                zinfo = zipfile.ZipInfo.from_file(fpath, rel_file)
                zinfo.external_attr = (0o644 | stat.S_IFREG) << 16
                with open(fpath, 'rb') as fp:
                    zf.writestr(zinfo, fp.read(), compress_type=zipfile.ZIP_DEFLATED)
                count += 1

zip_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
print(f"Successfully packaged {count} files into {output_zip} ({zip_size_mb:.2f} MB)")
