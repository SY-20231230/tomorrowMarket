import os
import json
import joblib
from pathlib import Path
from loguru import logger
import lightgbm as lgb
import torch
from transformers import BertForSequenceClassification, BertTokenizerFast

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_ROOT = BASE_DIR / "models"
LIGHTGBM_ROOT = MODEL_ROOT / "lightgbm"
TFT_ROOT = MODEL_ROOT / "tft"
SENTIMENT_ROOT = MODEL_ROOT / "sentiment"

class ModelRegistry:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelRegistry, cls).__new__(cls)
            cls._instance.lightgbm_models = {}  # {(industry, horizon): model}
            cls._instance.features_config = {}  # {(industry, horizon): features_list}
            cls._instance.tft_models = {}       # {(industry, horizon): tft_model}
            cls._instance.tft_meta = {}         # {(industry, horizon): meta_dict}
            cls._instance.sentiment_model = None
            cls._instance.sentiment_tokenizer = None
        return cls._instance

    def initialize(self):
        logger.info("Initializing ModelRegistry...")
        self._load_lightgbm_models()
        self._load_tft_models()
        self._load_sentiment_model()
        logger.info("ModelRegistry initialization complete.")

    def _load_lightgbm_models(self):
        logger.info(f"Scanning LightGBM models in {LIGHTGBM_ROOT}")
        if not LIGHTGBM_ROOT.exists():
            logger.warning(f"LightGBM root not found at {LIGHTGBM_ROOT}")
            return

        for industry_dir in LIGHTGBM_ROOT.iterdir():
            if not industry_dir.is_dir():
                continue
            industry = industry_dir.name
            for horizon_dir in industry_dir.iterdir():
                if not horizon_dir.is_dir():
                    continue
                horizon = horizon_dir.name
                
                model_path = horizon_dir / "model.pkl"
                features_path = horizon_dir / "features.json"

                if model_path.exists() and features_path.exists():
                    try:
                        # Load model
                        model = joblib.load(model_path)
                        
                        # Load features
                        with open(features_path, "r", encoding="utf-8") as f:
                            features = json.load(f)
                            
                        # Validation (Rule 18)
                        if len(features) != 45:
                            raise ValueError(f"Feature count mismatch in {industry}/{horizon}: expected 45, got {len(features)}")
                            
                        model_features = getattr(model, "n_features_in_", getattr(model, "num_features", None))
                        if hasattr(model, "booster_"):
                            model_features = model.booster_.num_feature()
                            
                        if model_features is not None and model_features != len(features):
                            raise ValueError(f"Model feature count ({model_features}) does not match features.json ({len(features)}) in {industry}/{horizon}")
                        
                        self.lightgbm_models[(industry, horizon.upper())] = model
                        self.features_config[(industry, horizon.upper())] = features
                        logger.info(f"Loaded LightGBM model for {industry} / {horizon.upper()}")
                        
                    except Exception as e:
                        logger.error(f"Failed to load LightGBM model for {industry}/{horizon}: {str(e)}")
                        raise e

    def _load_tft_models(self):
        logger.info(f"Scanning TFT models in {TFT_ROOT}")
        # Note: TFT loading logic will be implemented here using pytorch-forecasting.
        # For Stage 1, we just set up the placeholder to not block startup if torch is slow.
        pass

    def _load_sentiment_model(self):
        logger.info(f"Scanning Sentiment model in {SENTIMENT_ROOT}")
        model_path = SENTIMENT_ROOT / "best_klue_bert_model.pt"
        if not model_path.exists():
            logger.warning(f"Sentiment model not found at {model_path}")
            return
            
        try:
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"Loading KLUE BERT sentiment model onto {device}")
            model_name = "klue/bert-base"
            
            # Initialize model architecture
            model = BertForSequenceClassification.from_pretrained(model_name, num_labels=3)
            # Load trained weights
            model.load_state_dict(torch.load(model_path, map_location=device))
            model.to(device)
            model.eval()
            
            # Load tokenizer
            tokenizer = BertTokenizerFast.from_pretrained(model_name)
            
            self.sentiment_model = model
            self.sentiment_tokenizer = tokenizer
            logger.info("Successfully loaded Sentiment model and tokenizer.")
        except Exception as e:
            logger.error(f"Failed to load Sentiment model: {str(e)}")
            raise e

    def get_lightgbm_model(self, industry: str, horizon: str):
        return self.lightgbm_models.get((industry, horizon.upper()))

    def get_features(self, industry: str, horizon: str):
        return self.features_config.get((industry, horizon.upper()))

registry = ModelRegistry()
