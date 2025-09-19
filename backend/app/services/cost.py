import re
from typing import Dict
from app.infra.redis_client import safe_get, safe_set

# crude demo price table (USD/month ballparks)
DEFAULTS = {
    "aws:alb": 25,
    "aws:ecs_service": 80,   # per task pair ~*2 when x2
    "aws:rds:postgres": 120, # single small instance
    "aws:cloudfront": 20,
    "s3:static": 2,
    "cloudflare:cdn": 20,
    "supabase:postgres": 29,
    "aws:lambda": 5,
}

COST_RE = re.compile(r"cost\s*=\s*([~]?\s*\d+)\s*/\s*mo", re.I)

def ensure_cost_in_meta(key: str, meta: Dict[str, str], mods: str | None = None) -> Dict[str, str]:
    """If meta contains cost, leave it. Else add default cost."""
    if "cost" in meta:
        return meta
    base = DEFAULTS.get(key, 10)
    # multiplier for xN
    if mods:
        for tok in mods.split():
            if tok.startswith("x"):
                try:
                    mult = int(tok[1:])
                    base = base * max(1, mult)
                except ValueError:
                    pass
    meta["cost"] = f"{int(base)}/mo"
    return meta
