from fastapi import APIRouter
from app.registry.model_registry import registry

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
