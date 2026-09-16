from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.registry.model_registry import registry
from app.db.session import get_db
from app.schemas.sentiment import SentimentAnalyzeRequest, SentimentAnalyzeResponse
from app.schemas.predict import BatchPredictRequest, BatchPredictResponse, PredictResultItem
from app.services.sentiment_service import analyze_and_update_sentiment
from app.services.data_fetcher import DataFetcher
from app.services.feature_engineer import FeatureEngineer
from app.services.inference_pipeline import InferencePipeline
from datetime import datetime, timedelta

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

@router.post("/predict/batch", response_model=BatchPredictResponse)
def batch_predict(request: BatchPredictRequest, db: Session = Depends(get_db)):
    base_date = datetime.strptime(request.base_date, "%Y-%m-%d")
    start_date = base_date - timedelta(days=90) # Fetch enough history for rolling/pct_change
    
    all_predictions = []
    
    try:
        for item in request.target_symbols:
            symbol = item["symbol"]
            industry = item["industry"]
            
            # 1. Fetch DB Data
            stock_df = DataFetcher.get_stock_history(db, symbol, start_date, base_date)
            sentiment_df = DataFetcher.get_sentiment_history(db, symbol, start_date, base_date)
            
            if stock_df.empty:
                continue
                
            # 2. Feature Engineering
            feat_df = FeatureEngineer.engineer_features(stock_df, sentiment_df, industry)
            
            # 3. Inference loop
            for horizon in request.horizons:
                res_df = InferencePipeline.run_inference(symbol, industry, horizon, feat_df, base_date)
                if not res_df.empty:
                    for _, row in res_df.iterrows():
                        all_predictions.append(
                            PredictResultItem(
                                symbol=row['symbol'],
                                target_date=row['target_date'],
                                predicted_value=row['predicted_value'],
                                horizon=row['horizon']
                            )
                        )
                        
        return BatchPredictResponse(
            base_date=request.base_date,
            status="SUCCESS",
            predictions=all_predictions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


