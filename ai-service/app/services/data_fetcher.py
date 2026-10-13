import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.models import StockHistory, Article

class DataFetcher:
    @staticmethod
    def get_stock_history(db: Session, symbol: str, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        query = db.query(StockHistory).filter(
            StockHistory.stock_code == symbol,
            StockHistory.history_date >= start_date,
            StockHistory.history_date <= end_date
        ).order_by(StockHistory.history_date.asc())
        
        df = pd.read_sql(query.statement, db.bind)
        if not df.empty:
            for date_col in ['history_date', 'HISTORY_DATE', 'base_date', 'BASE_DATE']:
                if date_col in df.columns:
                    df.rename(columns={date_col: 'Date'}, inplace=True)
                    break
            for sym_col in ['stock_code', 'STOCK_CODE']:
                if sym_col in df.columns:
                    df.rename(columns={sym_col: 'symbol'}, inplace=True)
                    break
            df['Date'] = pd.to_datetime(df['Date'])
            df = df.set_index('Date')
        return df

    @staticmethod
    def get_sentiment_history(db: Session, symbol: str, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        query = db.query(
            Article.news_date,
            Article.sentiment_score
        ).filter(
            Article.symbol == symbol,
            Article.news_date >= start_date,
            Article.news_date <= end_date,
            Article.sentiment_score.isnot(None)
        )
        
        df = pd.read_sql(query.statement, db.bind)
        if not df.empty:
            df.rename(columns={'news_date': 'Date'}, inplace=True)
            df['Date'] = pd.to_datetime(df['Date']).dt.normalize()
            # If multiple articles per day, average the sentiment score
            df = df.groupby('Date')['sentiment_score'].mean().reset_index()
            df = df.set_index('Date')
        return df
