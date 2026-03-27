from __future__ import annotations

import json
import sqlite3
from contextlib import closing
from typing import Any

from app.core.config import settings
from app.services.firebase_client import FirebaseClient


class StorageService:
    def __init__(self) -> None:
        self.db_path = settings.sqlite_path
        self.firebase = FirebaseClient()
        self._init_db()

    def _init_db(self) -> None:
        with closing(sqlite3.connect(self.db_path)) as conn:
            conn.execute(
                '''
                CREATE TABLE IF NOT EXISTS scans (
                    scan_id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    overall_status TEXT NOT NULL,
                    recommendation TEXT NOT NULL,
                    payload_json TEXT NOT NULL
                )
                '''
            )
            conn.commit()

    def save_scan(self, payload: dict[str, Any]) -> None:
        with closing(sqlite3.connect(self.db_path)) as conn:
            conn.execute(
                '''
                INSERT OR REPLACE INTO scans (scan_id, created_at, overall_status, recommendation, payload_json)
                VALUES (?, ?, ?, ?, ?)
                ''',
                (
                    payload["scan_id"],
                    payload["created_at"],
                    payload["overall_status"],
                    payload["recommendation"],
                    json.dumps(payload),
                ),
            )
            conn.commit()
        self.firebase.save_scan(payload)

    def get_scan(self, scan_id: str) -> dict[str, Any] | None:
        with closing(sqlite3.connect(self.db_path)) as conn:
            row = conn.execute(
                "SELECT payload_json FROM scans WHERE scan_id = ?",
                (scan_id,),
            ).fetchone()
        if not row:
            return None
        return json.loads(row[0])

    def list_scans(self, limit: int = 20) -> list[dict[str, Any]]:
        with closing(sqlite3.connect(self.db_path)) as conn:
            rows = conn.execute(
                "SELECT payload_json FROM scans ORDER BY created_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [json.loads(row[0]) for row in rows]
