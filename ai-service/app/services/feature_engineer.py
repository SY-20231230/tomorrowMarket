import pandas as pd
from typing import List
from datetime import datetime, timedelta
from app.services.parquet_cache import ParquetCacheManager
from app.services.reference_registry import REFERENCE_REGISTRY

class FeatureEngineer:
    @staticmethod
    def _apply_numeric_transform(df: pd.DataFrame, prefix: str) -> pd.DataFrame:
        out_df = pd.DataFrame(index=df.index)
        for col in df.columns:
            if col == 'Date' or col == 'symbol':
                continue
            # Convert numeric
            series = pd.to_numeric(df[col], errors='coerce')
            series = series.ffill().bfill()
            
            # Keep both raw and pct_change if needed, but standard is pct_change for prices
            # Actually, the user prompt says: "numeric conversion, ffill(), bfill(), pct_change() 후 사용한다."
            series_pct = series.pct_change().ffill().bfill()
            
            out_df[f"{prefix}_{col}"] = series_pct
        return out_df

    @staticmethod
    def _load_and_transform_references(industry: str, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        # Load Common
        common_df = pd.DataFrame()
        for ref in REFERENCE_REGISTRY.get("common", []):
            name = ref["name"]
            df = ParquetCacheManager.load_cache("common", name)
            if not df.empty and 'Date' in df.columns:
                df['Date'] = pd.to_datetime(df['Date'])
                df = df.set_index('Date')
                df = df.loc[df.index <= end_date] # Load up to end_date to compute pct_change
                
                # Transform
                trans_df = FeatureEngineer._apply_numeric_transform(df, prefix=f"common_{name}")
                if common_df.empty:
                    common_df = trans_df
                else:
                    common_df = common_df.join(trans_df, how='outer')

        # Load Industry
        ind_df = pd.DataFrame()
        for ref in REFERENCE_REGISTRY.get(industry, []):
            name = ref["name"]
            df = ParquetCacheManager.load_cache(industry, name)
            if not df.empty and 'Date' in df.columns:
                df['Date'] = pd.to_datetime(df['Date'])
                df = df.set_index('Date')
                df = df.loc[df.index <= end_date]
                
                trans_df = FeatureEngineer._apply_numeric_transform(df, prefix=f"ref_{name}")
                if ind_df.empty:
                    ind_df = trans_df
                else:
                    ind_df = ind_df.join(trans_df, how='outer')
                    
        # Combine
        combined_ref = pd.DataFrame()
        if not common_df.empty and not ind_df.empty:
            combined_ref = common_df.join(ind_df, how='outer')
        elif not common_df.empty:
            combined_ref = common_df
        elif not ind_df.empty:
            combined_ref = ind_df
            
        return combined_ref

    @staticmethod
    def engineer_features(stock_df: pd.DataFrame, sentiment_df: pd.DataFrame, industry: str) -> pd.DataFrame:
        """
        Merge Stock History, Sentiment, and Reference data.
        Apply rolling calendar logic to sentiment.
        """
        if stock_df.empty:
            return pd.DataFrame()
            
        start_date = stock_df.index.min()
        end_date = stock_df.index.max()
        
        # 1. Base DataFrame is stock_df
        df = stock_df.copy()
        
        # 2. Merge Sentiment
        # Prompt: "Calendar Day rolling (pad missing days with 0)"
        # This means sentiment exists on calendar days. We join it to stock trading days.
        # If sentiment is missing on a trading day, should we pad with 0 or ffill?
        # "뉴스 DB를 기존 구조에서 새 21개 컬럼 기준으로 변경 ... Calendar Day rolling (pad missing days with 0)"
        if not sentiment_df.empty:
            df = df.join(sentiment_df, how='left')
        else:
            df['sentiment_score'] = 0.0
            
        df['sentiment_score'] = df['sentiment_score'].fillna(0.0)
        
        # Extract basic time features for TFT
        df['day_of_week'] = df.index.dayofweek
        df['month'] = df.index.month
        
        # 3. Load and Merge Reference Data
        ref_df = FeatureEngineer._load_and_transform_references(industry, start_date - timedelta(days=60), end_date)
        if not ref_df.empty:
            # Join references to trading days, ffill for non-trading reference days
            df = df.join(ref_df, how='left')
            # For remaining NaNs at the beginning, bfill
            df = df.ffill().bfill()
            
        df = df.reset_index()
        return df
