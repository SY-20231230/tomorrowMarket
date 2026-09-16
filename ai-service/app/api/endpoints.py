from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.registry.model_registry import registry
from app.db.session import get_db
from app.schemas.sentiment import SentimentAnalyzeRequest, SentimentAnalyzeResponse
from app.services.sentiment_service import analyze_and_update_sentiment

router = APIRouter()

@router.get("/health")
def health_check():
    loaded_lgb = len(registry.lightgbm_models)
    loaded_tft = len(registry.tft_models)
    
    status = "OK"
    if loaded_lgb == 0:
        status = "WARNING: No LightGBM models loaded"
        
    return {
        "status": status,
        "models_loaded": {
            "lightgbm": loaded_lgb,
            "tft": loaded_tft,
            "sentiment": registry.sentiment_model is not None
        }
    }

@router.post("/sentiment/analyze", response_model=SentimentAnalyzeResponse)
def analyze_sentiment(request: SentimentAnalyzeRequest, db: Session = Depends(get_db)):
    if not request.article_ids:
        raise HTTPException(status_code=400, detail="article_ids list cannot be empty")
        
    try:
        success, failed = analyze_and_update_sentiment(db, request.article_ids)
        return SentimentAnalyzeResponse(
            total_requested=len(request.article_ids),
            success_count=success,
            failed_count=failed
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

