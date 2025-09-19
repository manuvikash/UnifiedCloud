from fastapi import APIRouter, HTTPException
from app.schemas import ChatReq, ChatRes
from app.services.plan import build_plan
from app.services.telemetry import log_chat


router = APIRouter()

@router.post("/chat", response_model=ChatRes)
def chat(req: ChatReq):
    try:
        result = build_plan(req.context, req.history, req.message)
        log_chat(req.context, req.history, req.message,
                 result["components"], result["connections"], result.get("notes",""), ok=True)
        return ChatRes(**result)
    except Exception as e:
        log_chat(req.context, req.history, req.message, [], [], "", ok=False, error=str(e))
        raise HTTPException(status_code=502, detail=f"generation failed: {e}")
