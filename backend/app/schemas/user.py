from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class UserBase(BaseModel):
    name: str
    email: Optional[str] = None
    wake_time: str = "07:00"
    sleep_time: str = "23:00"
    daily_capacity_hours: float = 6.0

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int
    burnout_risk_score: float
    created_at: datetime

    class Config:
        from_attributes = True
