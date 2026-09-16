import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.registry.model_registry import registry
from app.api.endpoints import router as api_router
from loguru import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load models and validate features
    logger.info("Starting AI Service...")
    try:
        registry.initialize()
    except Exception as e:
        logger.error(f"Failed to initialize models during startup: {str(e)}")
        # Raise exception to block startup if models are inconsistent
        raise e
        
    yield
    
    # Shutdown
    logger.info("Shutting down AI Service...")

app = FastAPI(
    title="TomorrowMarket AI Service",
    description="Inference service for TFT and LightGBM ensemble models.",
    version="1.0.0",
    lifespan=lifespan
)

# Include routers
app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
