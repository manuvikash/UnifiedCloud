import json
from typing import List
from pathlib import Path

from app.services.llm_claude import generate_plan
from app.services.catalog import normalize_provider_type
from app.services.cost import ensure_cost_in_meta
from app.utils.parse import parse_component_line, ensure_meta_str

PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "system.txt"
SYSTEM_PROMPT = PROMPT_PATH.read_text(encoding="utf-8")

def build_plan(context: str, history: List[str], message: str) -> dict:
    """
    Returns ChatRes-like dict:
      { "components":[str...], "connections":[str...], "notes": str }
    """
    raw = generate_plan(SYSTEM_PROMPT, context=context, history=history, message=message)

    # If model failed, just return as-is
    components: List[str] = raw.get("components", [])
    connections: List[str] = raw.get("connections", [])
    notes: str = raw.get("notes", "")

    # Normalize each component string and ensure cost
    normed: List[str] = []
    for line in components:
        try:
            idx, provider, ctype, mods, meta = parse_component_line(f"{line}".strip())
            provider, ctype = normalize_provider_type(provider, ctype)

            # Ensure region default if missing
            if "region" not in meta:
                meta["region"] = "us-west-2" if provider == "aws" else "global"

            # Ensure cost present
            meta = ensure_cost_in_meta(f"{provider}:{ctype}", meta, mods)

            # Recompose string in the exact contract format
            meta_str = ensure_meta_str(meta)
            new_line = f"{idx} {provider}:{ctype}" + (f" {mods}" if mods else "") + f" | {meta_str}"
            normed.append(new_line)
        except Exception:
            # If parsing fails, keep the original line (frontend is resilient)
            normed.append(line)

    return {
        "components": normed,
        "connections": [str(c) for c in connections],
        "notes": notes or "",
    }
