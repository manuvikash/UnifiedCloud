from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas import TfReq
from app.services.exporter import generate_zip
from app.services.telemetry import log_export

router = APIRouter()

@router.post("/terraform")
def terraform(req: TfReq):
    try:
        data = generate_zip(req.components, req.connections)
        log_export(req.components, req.connections, ok=True, size_bytes=len(data))
        return StreamingResponse(
            iter([data]),
            media_type="application/zip",
            headers={"Content-Disposition": 'attachment; filename="terraform-export.zip"'}
        )
    except Exception as e:
        log_export(req.components, req.connections, ok=False, err=str(e))
        raise HTTPException(status_code=502, detail=f"terraform generation failed: {e}")
