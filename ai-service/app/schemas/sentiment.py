from pydantic import BaseModel
from typing import List

class SentimentAnalyzeRequest(BaseModel):
    article_ids: List[int]
    
class SentimentAnalyzeResponse(BaseModel):
    total_requested: int
    success_count: int
    failed_count: int
