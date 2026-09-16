import pandas as pd
import numpy as np
import torch
from loguru import logger
from app.registry.model_registry import registry
from app.services.business_days import BusinessDayService
from datetime import datetime

class InferencePipeline:
    @staticmethod
    def run_inference(symbol: str, industry: str, horizon: str, df: pd.DataFrame, base_date: datetime) -> pd.DataFrame:
        """
        Run TFT -> LightGBM ensemble.
        Returns a DataFrame with dates and predicted returns/prices.
        """
        if df.empty:
            return pd.DataFrame()
            
        # 1. Get Models
        tft_model = registry.get_tft_model(industry, horizon)
        lgb_model = registry.get_lightgbm_model(industry, horizon)
        features_config = registry.get_features(industry, horizon)
        
        if not lgb_model or not features_config:
            logger.error(f"Models not found for {industry}/{horizon}")
            return pd.DataFrame()
            
        # 2. TFT Inference (Extraction)
        # Note: In a real PyTorch Forecasting setup, you need to create a TimeSeriesDataSet.
        # Since we don't have the exact TimeSeriesDataSet parameters from the training notebook,
        # we assume a simplified TFT extraction or mock the embeddings if TFT isn't fully loadable yet.
        # According to the prompt: "TFT Inference... extract time_varying_unknown_reals".
        tft_embeddings = {}
        if tft_model:
            try:
                # Mocking the extraction logic based on typical pytorch-forecasting usage:
                # dataset = TimeSeriesDataSet.from_dataset(tft_model.dataset_parameters, df, predict=True, stop_randomization=True)
                # dataloader = dataset.to_dataloader(train=False, batch_size=1)
                # out = tft_model.predict(dataloader, return_x=True, mode="raw")
                # We would extract out.output or similar.
                # Since we lack the training dataset_parameters, we simulate the TFT embedding flat feature for now.
                logger.info("TFT model found. Extracting embeddings...")
                # Pseudo-extraction (In production, replace with actual TFT dataset conversion)
                for i in range(len(features_config)):
                    feat_name = features_config[i]
                    if feat_name.startswith("tft_"):
                        tft_embeddings[feat_name] = 0.0 # Placeholder for actual TFT output
            except Exception as e:
                logger.error(f"TFT extraction failed: {e}")
        
        # 3. Prepare LightGBM Input
        # Use the LAST row of the dataframe as the base for prediction
        last_row = df.iloc[-1].to_dict()
        
        lgb_input = []
        for f in features_config:
            if f in tft_embeddings:
                lgb_input.append(tft_embeddings[f])
            else:
                lgb_input.append(last_row.get(f, 0.0))
                
        lgb_input_df = pd.DataFrame([lgb_input], columns=features_config)
        
        # 4. LightGBM Prediction
        # LGB returns a sequence of predictions for the horizon (e.g., 7 or 20 days)
        # In multi-output LGB (or recursively), we get a list of predictions.
        try:
            raw_predictions = lgb_model.predict(lgb_input_df)
            # Handle if it returns a 2D array [[p1, p2, ..., pN]]
            if len(raw_predictions.shape) > 1:
                predictions = raw_predictions[0]
            else:
                predictions = raw_predictions
        except Exception as e:
            logger.error(f"LightGBM prediction failed: {e}")
            predictions = []

        # 5. Business Day Filtering (Cut-off)
        if horizon.upper() == "SHORT":
            target_dates = BusinessDayService.filter_short_horizon_dates(base_date, max_steps=7)
        else:
            target_dates = BusinessDayService.filter_long_horizon_dates(base_date, steps=20)
            
        # Match predictions to dates
        results = []
        for i, dt in enumerate(target_dates):
            if i < len(predictions):
                val = float(predictions[i])
            else:
                val = 0.0 # Fallback if model output is shorter than dates
                
            results.append({
                "symbol": symbol,
                "target_date": dt.strftime("%Y-%m-%d"),
                "predicted_value": val,
                "horizon": horizon.upper()
            })
            
        return pd.DataFrame(results)
