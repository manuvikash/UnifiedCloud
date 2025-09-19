import re
from typing import Dict, Tuple, List

COMPONENT_RE = re.compile(
    r"^\s*(\d+)\s+([a-z0-9_-]+):([a-z0-9:_-]+)(?:\s+(.+?))?\s*\|\s*(.+?)\s*$",
    re.IGNORECASE,
)

def parse_component_line(line: str):
    """
    Returns: (index:int, provider:str, ctype:str, mods:str|None, meta:Dict[str,str])
    Accepts lines like:
      1 aws:ecs_service x2 | region=us-west-2; cost=160/mo; scale=high
    """
    m = COMPONENT_RE.match(line)
    if not m:
        raise ValueError(f"bad component line: {line}")
    idx = int(m.group(1))
    provider = m.group(2).lower()
    ctype = m.group(3).lower()
    mods = (m.group(4) or "").strip() or None
    meta_raw = m.group(5)

    meta: Dict[str, str] = {}
    for part in [p.strip() for p in meta_raw.split(";") if p.strip()]:
        if "=" in part:
            k, v = part.split("=", 1)
            meta[k.strip().lower()] = v.strip()
    return idx, provider, ctype, mods, meta

def parse_connections(conns: List[str]) -> List[Tuple[int, int]]:
    pairs: List[Tuple[int, int]] = []
    for s in conns:
        s = s.strip()
        if "->" not in s:
            raise ValueError(f"bad connection '{s}'")
        a, b = s.split("->", 1)
        pairs.append((int(a), int(b)))
    return pairs

def ensure_meta_str(meta: Dict[str, str]) -> str:
    """Serialize meta dict as 'k=v; ...' with a friendly key order."""
    priority = ["region", "cost", "scale", "desc"]
    keys = [k for k in priority if k in meta] + [k for k in meta.keys() if k not in priority]
    return "; ".join(f"{k}={meta[k]}" for k in keys)
