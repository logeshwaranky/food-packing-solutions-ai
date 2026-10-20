import zipfile
import os

zip_filename = 'food-packing-solutions-ai.zip'
exclude_dirs = {'node_modules', '.git', '__pycache__', '.pytest_cache', 'dist'}

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for f in files:
            if f == zip_filename or f == 'make_zip.py' or f == 'inspect_dataset.py' or f == 'dataset_inspection.json':
                continue
            file_path = os.path.join(root, f)
            arcname = os.path.relpath(file_path, '.')
            zipf.write(file_path, arcname)

size_mb = os.path.getsize(zip_filename) / (1024 * 1024)
print(f"Archive successfully created: {zip_filename} ({size_mb:.2f} MB)")
