import os
import pandas as pd
from pathlib import Path
from loguru import logger

CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "runtime-data" / "tft-reference"

class ParquetCacheManager:
    @staticmethod
    def get_cache_path(industry: str, name: str) -> Path:
        dir_path = CACHE_DIR / industry
        dir_path.mkdir(parents=True, exist_ok=True)
        return dir_path / f"{name}.parquet"

    @staticmethod
    def load_cache(industry: str, name: str) -> pd.DataFrame:
        path = ParquetCacheManager.get_cache_path(industry, name)
        if path.exists():
            try:
                df = pd.read_parquet(path)
                # Ensure index is datetime or Date column exists
                return df
            except Exception as e:
                logger.error(f"Failed to read parquet cache {path}: {e}")
        return pd.DataFrame()

    @staticmethod
    def get_last_date(df: pd.DataFrame) -> pd.Timestamp:
        if df.empty:
            return None
        if 'Date' in df.columns:
            return pd.to_datetime(df['Date']).max()
        elif isinstance(df.index, pd.DatetimeIndex):
            return df.index.max()
        return None

    @staticmethod
    def update_cache(industry: str, name: str, new_df: pd.DataFrame) -> None:
        if new_df.empty:
            return
            
        path = ParquetCacheManager.get_cache_path(industry, name)
        old_df = ParquetCacheManager.load_cache(industry, name)
        
        if not old_df.empty:
            # Concat old and new
            df = pd.concat([old_df, new_df])
        else:
            df = new_df
            
        # Standardize Date column if it's in index
        if isinstance(df.index, pd.DatetimeIndex) and 'Date' not in df.columns:
            df = df.reset_index()
            df.rename(columns={'index': 'Date'}, inplace=True)
            
        if 'Date' in df.columns:
            df['Date'] = pd.to_datetime(df['Date'])
            df = df.sort_values('Date').drop_duplicates(subset=['Date'], keep='last')
            
        # Overwrite
        df.to_parquet(path, index=False)
        logger.info(f"Updated cache for {industry}/{name}. Total rows: {len(df)}")
