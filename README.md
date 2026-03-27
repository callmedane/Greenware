# Greenware Pi App Starter

A Raspberry Pi 5 starter project for a **local kiosk dashboard** for greenware clay inspection.

This draft is designed around your project documents:
- detect surface and subsurface debris
- map defect coordinates
- show recommendations
- render a simple 2D/3D digital twin
- support Raspberry Pi deployment
- support Firebase sync for inspection history

## Stack
- Python + FastAPI
- HTML/CSS/JavaScript dashboard
- Three.js for a lightweight 3D clay view
- SQLite for local fallback storage
- Firebase Admin SDK for cloud sync
- Stubbed model + sensor services so you can replace them later

## What is mocked right now
- camera/model inference
- thermal readings
- spectral classification
- force/vibration/capacitive/inductive/color sensor values
- digital twin mesh generation

## Project structure
- `backend/app/main.py` - FastAPI entry point
- `backend/app/services/inference.py` - mock inference pipeline
- `backend/app/services/sensors.py` - mock sensor adapters
- `backend/app/services/fusion.py` - simple fusion logic
- `backend/app/services/storage.py` - SQLite + Firebase sync
- `backend/app/templates/index.html` - dashboard UI
- `deploy/run_pi.sh` - local launch script
- `deploy/greenware-dashboard.service` - systemd service example

## Quick start
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Open:
`http://localhost:8000`

## Firebase setup
1. Create a Firebase project.
2. Enable Firestore.
3. Download a service account JSON file.
4. Put its path in `.env`:
```env
FIREBASE_ENABLED=true
FIREBASE_CREDENTIALS=/absolute/path/to/serviceAccountKey.json
FIREBASE_PROJECT_ID=your-project-id
```

## Notes
This is a **starter implementation**, not a finished production system.
It is meant to let your team keep moving while the final model and exact sensor wiring are still unfinished.
