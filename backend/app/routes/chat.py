from fastapi import APIRouter, HTTPException
from app.schemas import ChatReq, ChatRes
from app.services.plan import build_plan

router = APIRouter()

@router.post("/chat", response_model=ChatRes)
def chat(req: ChatReq):
    try:
        result = build_plan(req.context, req.history, req.message)
        return ChatRes(**result)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"generation failed: {e}")
