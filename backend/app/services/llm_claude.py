import json
from typing import List
from anthropic import Anthropic
from app.config import CLAUDE_API_KEY, CLAUDE_MODEL, CLAUDE_TIMEOUT_S

_client = Anthropic(api_key=CLAUDE_API_KEY) if CLAUDE_API_KEY else None

def generate_plan(system_prompt: str, context: str, history: List[str], message: str) -> dict:
    """
    Asks Claude to return strictly JSON:
      { "components": [string...], "connections": [string...], "notes": "..." }
    """
    if not _client:
        # Fallback stub for local dev without a key
        return {
            "components": [
                "cloudflare:cdn | region=global; cost=20/mo; scale=high",
                "aws:alb | region=us-west-2; cost=25/mo; scale=med",
                "aws:ecs_service x2 | region=us-west-2; cost=160/mo; scale=high",
                "supabase:postgres | region=us-west-2; cost=29/mo; scale=med",
                "s3:static | region=us-west-2; cost=2/mo; scale=low",
            ],
            "connections": ["0->1","1->2","2->3","4->0"],
            "notes": "stub (no API key): added ALB + Multi-AZ DB; CDN in front; S3 assets"
        }

    msgs = []
    if context:
        msgs.append(f"CONTEXT:\n{context}")
    if history:
        msgs.append("HISTORY:\n" + "\n".join(history))
    msgs.append(f"MESSAGE:\n{message}")

    user_prompt = "\n\n".join(msgs) + """
\n\nOUTPUT FORMAT (STRICT):
Return a single JSON object with keys:
- "components": array of strings, each like "provider:type mods? | key=val; key=val"
- "connections": array of strings like "a->b"
- "notes": short string
No markdown, no code fences, no extra text.
"""

    resp = _client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=800,
        temperature=0.2,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
        timeout=CLAUDE_TIMEOUT_S,
    )

    # Extract text content
    text = ""
    for block in resp.content:
        if block.type == "text":
            text += block.text

    # Try to parse JSON
    text = text.strip()
    if text.startswith("```"):
        # In case model wraps; try to strip code fences
        text = text.strip("`")
        # remove possible json hint
        text = text.replace("json", "", 1).strip()

    try:
        return json.loads(text)
    except Exception:
        # If not JSON, wrap as a single-note error
        return {
            "components": [],
            "connections": [],
            "notes": f"model_return_not_json: {text[:200]}"
        }
