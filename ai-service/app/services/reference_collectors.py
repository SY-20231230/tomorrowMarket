import yfinance as yf
import pandas_datareader.data as web
import FinanceDataReader as fdr
import pandas as pd
from datetime import datetime
from loguru import logger

class YahooReferenceCollector:
    @staticmethod
    def collect(symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        try:
            logger.info(f"Downloading YAHOO data for {symbol} from {start_date} to {end_date}")
            df = yf.download(symbol, start=start_date, end=end_date, progress=False)
            if not df.empty:
                df = df.reset_index()
                # yfinance returns multi-index columns sometimes in newer versions, flatten if needed
                if isinstance(df.columns, pd.MultiIndex):
                    df.columns = ['_'.join(col).strip('_') for col in df.columns.values]
                # Ensure Date column name
                if 'Date' not in df.columns and 'index' in df.columns:
                    df.rename(columns={'index': 'Date'}, inplace=True)
            return df
        except Exception as e:
            logger.error(f"Error fetching YAHOO {symbol}: {e}")
            return pd.DataFrame()

class FredReferenceCollector:
    @staticmethod
    def collect(symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        try:
            logger.info(f"Downloading FRED data for {symbol} from {start_date} to {end_date}")
            df = web.DataReader(symbol, 'fred', start_date, end_date)
            if not df.empty:
                df = df.reset_index()
                df.rename(columns={'DATE': 'Date'}, inplace=True)
            return df
        except Exception as e:
            logger.error(f"Error fetching FRED {symbol}: {e}")
            return pd.DataFrame()

class KoreaReferenceCollector:
    @staticmethod
    def collect(symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
        try:
            logger.info(f"Downloading KOREA data for {symbol} from {start_date} to {end_date}")
            df = fdr.DataReader(symbol, start_date, end_date)
            if not df.empty:
                df = df.reset_index()
            return df
        except Exception as e:
            logger.error(f"Error fetching KOREA {symbol}: {e}")
            return pd.DataFrame()
