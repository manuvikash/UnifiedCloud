from typing import Tuple

# Very small normalization layer for demo
VALID_PROVIDERS = {
    "aws", "gcp", "azure", "cloudflare", "supabase", "vercel", "s3"
}

# Map a few aliases to canonical tokens
ALIASES = {
    "cf": ("cloudflare", "cdn"),
    "cloudfront": ("aws", "cloudfront"),
    "rds": ("aws", "rds:postgres"),
    "postgres": ("aws", "rds:postgres"),
    "bucket": ("s3", "static"),
}

def normalize_provider_type(provider: str, ctype: str) -> Tuple[str, str]:
    p = provider.lower()
    t = ctype.lower()
    if f"{p}:{t}" in ("cf:cdn",):
        p, t = ALIASES["cf"]

    if p not in VALID_PROVIDERS:
        # crude guess
        if p in ("s3",):
            return "s3", t
        return "aws", t  # default to aws for demo

    # common normalizations
    if p == "aws" and t in ("cloudfront",):
        t = "cloudfront"
    return p, t
