from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.chat import router as chat_router
from app.routes.terraform import router as tf_router

app = FastAPI(title="Unified Cloud Architect (Backend)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="")
app.include_router(tf_router, prefix="")

@app.get("/health")
def health():
    return {"ok": True}
