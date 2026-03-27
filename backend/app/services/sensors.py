from __future__ import annotations

import random
from app.models.schemas import SensorSnapshot


class MockSensorService:
    def read_all(self) -> SensorSnapshot:
        spectral = [round(random.uniform(0.1, 1.0), 3) for _ in range(8)]
        return SensorSnapshot(
            thermal_avg=round(random.uniform(26.0, 35.0), 2),
            moisture=round(random.uniform(18.0, 42.0), 2),
            hardness=round(random.uniform(0.3, 0.95), 3),
            vibration_peak=round(random.uniform(0.05, 1.2), 3),
            gas_level=round(random.uniform(10.0, 120.0), 2),
            spectral_signature=spectral,
            metallic_flag=random.choice([False, False, False, True]),
            ambient_temp=round(random.uniform(27.0, 33.0), 2),
        )
