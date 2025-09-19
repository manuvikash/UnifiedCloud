import io
import os
import zipfile

def zip_dir_to_bytes(path: str) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(path):
            for f in files:
                full = os.path.join(root, f)
                rel = os.path.relpath(full, start=path)
                z.write(full, rel)
    buf.seek(0)
    return buf.read()
