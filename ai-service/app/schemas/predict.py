from pydantic import BaseModel
from typing import List, Dict, Any

class BatchPredictRequest(BaseModel):
    base_date: str # "YYYY-MM-DD"
    target_symbols: List[Dict[str, str]] # e.g. [{"symbol": "005930", "industry": "ITAndSemiconductor"}]
    horizons: List[str] # ["SHORT", "LONG"]

class PredictResultItem(BaseModel):
    symbol: str
    target_date: str
    predicted_value: float
    horizon: str

class BatchPredictResponse(BaseModel):
    base_date: str
    status: str
    predictions: List[PredictResultItem]
