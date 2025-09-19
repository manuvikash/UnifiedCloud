import os
from dotenv import load_dotenv

load_dotenv()

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-latest")
CLAUDE_TIMEOUT_S = int(os.getenv("CLAUDE_TIMEOUT_S", "20"))

REDIS_URL = os.getenv("REDIS_URL", "")  # leave empty to run without Redis

QODO_BIN = os.getenv("QODO_BIN", "qodo")  # CLI name or absolute path
QODO_TIMEOUT_S = int(os.getenv("QODO_TIMEOUT_S", "40"))

TMP_DIR = os.getenv("TMP_DIR", "/tmp")
