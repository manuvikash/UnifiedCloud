import os
from typing import List, Optional
from app.config import HONEYHIVE_API_KEY

try:
    from honeyhive_logger import start as hh_start, log as hh_log
except Exception:
    hh_start = None
    hh_log = None

HH_PROJECT = os.getenv("HONEYHIVE_PROJECT", "UnifiedCloud")

def _safe_start(**kwargs) -> Optional[str]:
    if not (HONEYHIVE_API_KEY and HH_PROJECT and hh_start):
        return None
    try:
        sid = hh_start(verbose=True, **kwargs)  # <- verbose on
        return sid
    except Exception as e:
        print(f"[HoneyHive] start failed: {e}")
        return None

def _safe_log(**kwargs) -> None:
    if not (HONEYHIVE_API_KEY and HH_PROJECT and hh_log):
        return
    try:
        hh_log(verbose=True, **kwargs)  # <- verbose on
    except Exception as e:
        print(f"[HoneyHive] log failed: {e}")

def log_chat(context: str, history: List[str], message: str,
             out_components: List[str], out_connections: List[str],
             notes: str, ok: bool = True, error: Optional[str] = None):
    sid = _safe_start(
        api_key=HONEYHIVE_API_KEY, project=HH_PROJECT,
        session_name="chat", source="backend",
        inputs={"context": context, "history": history, "message": message},
        metadata={"ok": ok, "error": error or ""}
    )
    _safe_log(
        api_key=HONEYHIVE_API_KEY, project=HH_PROJECT, session_id=sid,
        event_name="chat_result", event_type="chain",
        inputs={"message": message},
        outputs={"components": out_components, "connections": out_connections, "notes": notes},
        metadata={"component_count": len(out_components)},
        duration_ms=10
    )

def log_export(components: List[str], connections: List[str],
               ok: bool, err: Optional[str] = None, size_bytes: Optional[int] = None):
    sid = _safe_start(
        api_key=HONEYHIVE_API_KEY, project=HH_PROJECT,
        session_name="terraform", source="backend",
        inputs={"components": components, "connections": connections},
        metadata={"ok": ok, "error": err or ""}
    )
    _safe_log(
        api_key=HONEYHIVE_API_KEY, project=HH_PROJECT, session_id=sid,
        event_name="terraform_export", event_type="tool",
        outputs={"zip_size_bytes": size_bytes or 0},
        metadata={"component_count": len(components), "connection_count": len(connections)},
        duration_ms=10
    )
