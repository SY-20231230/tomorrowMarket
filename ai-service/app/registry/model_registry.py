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
            cls._instance.loading_errors = []   # Detailed error messages
        return cls._instance

    def initialize(self):
        logger.info("Initializing ModelRegistry...")
        self.loading_errors.clear()
        self._load_lightgbm_models()
        self._load_tft_models()
        self._load_sentiment_model()
        logger.info(
            f"ModelRegistry initialization complete. "
            f"LightGBM: {len(self.lightgbm_models)}/18, "
            f"TFT: {len(self.tft_models)}/18, "
            f"Sentiment: {'Loaded' if self.sentiment_model is not None else 'Not Loaded'}"
        )

    def _load_lightgbm_models(self):
        logger.info(f"Scanning LightGBM models in {LIGHTGBM_ROOT}")
        if not LIGHTGBM_ROOT.exists():
            msg = f"[LightGBM] Root directory not found: {LIGHTGBM_ROOT}"
            logger.warning(msg)
            self.loading_errors.append(msg)
            return

        for industry_dir in sorted(LIGHTGBM_ROOT.iterdir()):
            if not industry_dir.is_dir():
                continue
            industry = industry_dir.name
            for horizon_dir in sorted(industry_dir.iterdir()):
                if not horizon_dir.is_dir():
                    continue
                horizon = horizon_dir.name
                target_key = (industry, horizon.upper())
                
                model_path = horizon_dir / "model.pkl"
                features_path = horizon_dir / "features.json"

                if not model_path.exists():
                    msg = f"[LightGBM] Model file missing: {model_path}"
                    logger.warning(msg)
                    self.loading_errors.append(msg)
                    continue
                if not features_path.exists():
                    msg = f"[LightGBM] Features file missing: {features_path}"
                    logger.warning(msg)
                    self.loading_errors.append(msg)
                    continue

                try:
                    # 1. Load model
                    model = joblib.load(model_path)
                    
                    # 2. Load features
                    with open(features_path, "r", encoding="utf-8") as f:
                        features = json.load(f)
                        
                    # 3. Validation (Rule 18: Feature count check)
                    if len(features) != 45:
                        raise ValueError(f"Feature count mismatch: expected 45, got {len(features)}")
                        
                    model_features = getattr(model, "n_features_in_", getattr(model, "num_features", None))
                    if hasattr(model, "booster_"):
                        model_features = model.booster_.num_feature()
                        
                    if model_features is not None and model_features != len(features):
                        raise ValueError(f"Model feature count ({model_features}) does not match features.json ({len(features)})")
                    
                    self.lightgbm_models[target_key] = model
                    self.features_config[target_key] = features
                    logger.info(f"Loaded LightGBM model for {industry} / {horizon.upper()}")
                    
                except MemoryError as e:
                    msg = f"[LightGBM] Out of memory loading {industry}/{horizon}: {str(e)}"
                    logger.error(msg)
                    self.loading_errors.append(msg)
                except ValueError as e:
                    msg = f"[LightGBM] Feature mismatch in {industry}/{horizon}: {str(e)}"
                    logger.error(msg)
                    self.loading_errors.append(msg)
                except Exception as e:
                    msg = f"[LightGBM] Failed to load {industry}/{horizon} ({model_path}): {str(e)}"
                    logger.error(msg)
                    self.loading_errors.append(msg)

    def _load_tft_models(self):
        logger.info(f"Scanning TFT models in {TFT_ROOT}")
        if not TFT_ROOT.exists():
            msg = f"[TFT] Root directory not found: {TFT_ROOT}"
            logger.warning(msg)
            self.loading_errors.append(msg)
            return
            
        try:
            from pytorch_forecasting import TemporalFusionTransformer
        except ImportError as e:
            msg = f"[TFT] pytorch_forecasting not installed or incompatible: {str(e)}"
            logger.warning(msg)
            self.loading_errors.append(msg)
            return

        for industry_dir in sorted(TFT_ROOT.iterdir()):
            if not industry_dir.is_dir():
                continue
            industry = industry_dir.name
            for horizon_dir in sorted(industry_dir.iterdir()):
                if not horizon_dir.is_dir():
                    continue
                horizon = horizon_dir.name
                target_key = (industry, horizon.upper())
                
                # Search for .ckpt or .pth recursively (e.g. in checkpoints/ folder)
                ckpt_files = list(horizon_dir.glob("**/*.ckpt"))
                if not ckpt_files:
                    ckpt_files = list(horizon_dir.glob("**/*.pth"))
                    
                if not ckpt_files:
                    msg = f"[TFT] Checkpoint file (.ckpt/.pth) missing in {horizon_dir}"
                    logger.warning(msg)
                    self.loading_errors.append(msg)
                    continue

                ckpt_path = ckpt_files[0]
                try:
                    # Safe CPU loader: resolves typo ('monotone_constraints' vs 'monotone_constaints'),
                    # unexpected extra training kwargs, and GPU-serialized metric tensors.
                    import io
                    checkpoint = torch.load(str(ckpt_path), map_location="cpu")
                    hparams = checkpoint.get("hyper_parameters", {})

                    if "monotone_constraints" in hparams:
                        hparams["monotone_constaints"] = hparams.pop("monotone_constraints")
                    if "mask_bias" in hparams:
                        del hparams["mask_bias"]
                    if "loss" in hparams and hasattr(hparams["loss"], "_device"):
                        hparams["loss"]._device = torch.device("cpu")
                    if "logging_metrics" in hparams:
                        for m in hparams["logging_metrics"]:
                            if hasattr(m, "_device"):
                                m._device = torch.device("cpu")

                    for k, v in checkpoint.get("state_dict", {}).items():
                        if hasattr(v, "device") and v.device.type != "cpu":
                            checkpoint["state_dict"][k] = v.cpu()

                    buf = io.BytesIO()
                    torch.save(checkpoint, buf)
                    buf.seek(0)

                    tft = TemporalFusionTransformer.load_from_checkpoint(buf, map_location="cpu")
                    tft.eval()
                    self.tft_models[target_key] = tft
                    
                    # Load metadata if exists
                    meta_files = list(horizon_dir.glob("**/*meta.json"))
                    if meta_files:
                        with open(meta_files[0], "r", encoding="utf-8") as mf:
                            self.tft_meta[target_key] = json.load(mf)

                    logger.info(f"Loaded TFT model for {industry} / {horizon.upper()} from {ckpt_path.name}")
                except MemoryError as e:
                    msg = f"[TFT] Out of memory loading checkpoint for {industry}/{horizon}: {str(e)}"
                    logger.error(msg)
                    self.loading_errors.append(msg)
                except Exception as e:
                    msg = f"[TFT] Failed to load checkpoint for {industry}/{horizon} ({ckpt_path.name}): {str(e)}"
                    logger.error(msg)
                    self.loading_errors.append(msg)

    def _load_sentiment_model(self):
        logger.info(f"Scanning Sentiment model in {SENTIMENT_ROOT}")
        model_path = SENTIMENT_ROOT / "best_klue_bert_model.pt"
        if not model_path.exists():
            msg = f"[Sentiment] Model weight file missing: {model_path}"
            logger.warning(msg)
            self.loading_errors.append(msg)
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
        except MemoryError as e:
            msg = f"[Sentiment] Out of memory loading KLUE BERT model: {str(e)}"
            logger.error(msg)
            self.loading_errors.append(msg)
        except Exception as e:
            msg = f"[Sentiment] Failed to load KLUE BERT model/tokenizer: {str(e)}"
            logger.error(msg)
            self.loading_errors.append(msg)

    def get_lightgbm_model(self, industry: str, horizon: str):
        return self.lightgbm_models.get((industry, horizon.upper()))

    def get_tft_model(self, industry: str, horizon: str):
        return self.tft_models.get((industry, horizon.upper()))

    def get_features(self, industry: str, horizon: str):
        return self.features_config.get((industry, horizon.upper()))

    def get_model_status(self):
        return {
            "lightgbm_count": len(self.lightgbm_models),
            "tft_count": len(self.tft_models),
            "sentiment_loaded": self.sentiment_model is not None,
            "loading_errors": self.loading_errors
        }

registry = ModelRegistry()
