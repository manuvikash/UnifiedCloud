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

DESCRIPTIONS = {
    "vercel:static": "Static hosting for React app",
    "cloudflare:cdn": "Global CDN and edge caching",
    "aws:alb": "Application Load Balancer",
    "aws:ecs_service": "ECS/Fargate service (containers)",
    "aws:rds:postgres": "Managed PostgreSQL database",
    "aws:redis": "ElastiCache Redis (caching)",
    "aws:api_gateway": "Managed API Gateway",
    "aws:cloudfront": "AWS CDN (CloudFront)",
    "s3:static": "Static site bucket (S3 website)",
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

def default_desc(provider: str, ctype: str, mods: str | None) -> str:
    key = f"{provider}:{ctype}"
    base = DESCRIPTIONS.get(key, f"{provider}:{ctype}")
    # small modifiers
    if mods:
        mods_l = mods.lower()
        if "multi-az" in mods_l and "Multi-AZ" not in base:
            base += " (Multi-AZ)"
        for tok in mods.split():
            if tok.startswith("x") and tok[1:].isdigit():
                base += f" ({tok[1:]} replicas)"
    return base