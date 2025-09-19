from typing import List, Optional
from pydantic import BaseModel, Field

class ChatReq(BaseModel):
    context: str = Field(..., description="Initial form as free text")
    history: List[str] = Field(default_factory=list, description="Chat turns")
    message: str = Field(..., description="Latest user ask")

class ChatRes(BaseModel):
    components: List[str]
    connections: List[str]
    notes: Optional[str] = ""

class TfReq(ChatRes):
    pass

class ErrorRes(BaseModel):
    error: str
