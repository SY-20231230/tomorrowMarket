import pandas as pd
from datetime import datetime, timedelta
from loguru import logger
from app.services.reference_registry import REFERENCE_REGISTRY
from app.services.parquet_cache import ParquetCacheManager
from app.services.reference_collectors import YahooReferenceCollector, FredReferenceCollector, KoreaReferenceCollector

class ReferenceDataService:
    def __init__(self):
        self.collectors = {
            "YAHOO": YahooReferenceCollector,
            "FRED": FredReferenceCollector,
            "KOREA": KoreaReferenceCollector
        }
        
    def _collect_data(self, provider: str, symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        collector = self.collectors.get(provider.upper())
        if not collector:
            logger.error(f"Unknown provider {provider}")
            return pd.DataFrame()
        return collector.collect(symbol, start_date, end_date)

    def update_reference(self, industry: str, ref_meta: dict, base_date: datetime) -> None:
        name = ref_meta["name"]
        provider = ref_meta["provider"]
        symbol = ref_meta["symbol"]
        
        # Check cache
        old_df = ParquetCacheManager.load_cache(industry, name)
        last_date = ParquetCacheManager.get_last_date(old_df)
        
        end_date_str = base_date.strftime("%Y-%m-%d")
        
        if last_date:
            # Check if up to date
            if last_date >= pd.to_datetime(base_date.date()):
                logger.info(f"{industry}/{name} is already up to date (last date: {last_date.date()})")
                return
            
            # Start from next day
            start_date_str = (last_date + timedelta(days=1)).strftime("%Y-%m-%d")
        else:
            # Start from a reasonable past date for training compatibility (e.g., 5 years back)
            start_date_str = (base_date - timedelta(days=365*5)).strftime("%Y-%m-%d")
            
        new_df = self._collect_data(provider, symbol, start_date_str, end_date_str)
        if not new_df.empty:
            ParquetCacheManager.update_cache(industry, name, new_df)
        else:
            logger.warning(f"No new data returned for {industry}/{name} from {start_date_str} to {end_date_str}")

    def update_all_references(self, base_date_str: str, industries: list = None):
        base_date = datetime.strptime(base_date_str, "%Y-%m-%d")
        
        # 1. Update Common references
        logger.info("Updating COMMON references...")
        for ref in REFERENCE_REGISTRY.get("common", []):
            self.update_reference("common", ref, base_date)
            
        # 2. Update Industry references
        if not industries:
            industries = [k for k in REFERENCE_REGISTRY.keys() if k != "common"]
            
        for ind in industries:
            logger.info(f"Updating references for industry: {ind}...")
            for ref in REFERENCE_REGISTRY.get(ind, []):
                self.update_reference(ind, ref, base_date)
                
        logger.info("Finished updating all reference caches.")
