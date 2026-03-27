from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request

from app.models.schemas import ScanStartResponse
from app.services.fusion import FusionService
from app.services.inference import MockInferenceService
from app.services.sensors import MockSensorService
from app.services.storage import StorageService

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

sensor_service = MockSensorService()
inference_service = MockInferenceService()
fusion_service = FusionService()
storage_service = StorageService()


@router.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@router.get("/api/health")
def health():
    return {"ok": True}


@router.post("/api/scan/start", response_model=ScanStartResponse)
def start_scan():
    snapshot = sensor_service.read_all()
    result = inference_service.run(snapshot)
    result = fusion_service.enrich(result)
    payload = result.model_dump(mode="json")
    storage_service.save_scan(payload)
    return ScanStartResponse(scan_id=result.scan_id, message="Mock scan completed successfully.")


@router.get("/api/scan/latest")
def latest_scan():
    scans = storage_service.list_scans(limit=1)
    if not scans:
        raise HTTPException(status_code=404, detail="No scans found.")
    return scans[0]


@router.get("/api/scan/{scan_id}")
def get_scan(scan_id: str):
    scan = storage_service.get_scan(scan_id)
    if scan is None:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return scan


@router.get("/api/history")
def history(limit: int = 20):
    return storage_service.list_scans(limit=limit)
