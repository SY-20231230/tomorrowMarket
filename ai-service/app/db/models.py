from sqlalchemy import Column, BigInteger, String, Text, Numeric, DateTime
from app.db.session import Base

class Article(Base):
    __tablename__ = 'ARTICLES'

    # Using BigInteger for PK if it maps to Spring Boot's Long id
    article_id = Column(BigInteger, primary_key=True, autoincrement=True)
    
    news_date = Column(DateTime, nullable=True)
    media = Column(String(100), nullable=True)
    reporter = Column(String(100), nullable=True)
    title = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    url = Column(String(500), nullable=True)
    
    symbol = Column(String(20), nullable=True)
    stock_name = Column(String(100), nullable=True)
    industry = Column(String(100), nullable=True)
    
    search_keyword = Column(String(100), nullable=True)
    keywords = Column(String(500), nullable=True)
    
    sentiment_label = Column(String(20), nullable=True)
    sentiment_score = Column(Numeric(10, 5), nullable=True)
    positive_prob = Column(Numeric(10, 5), nullable=True)
    neutral_prob = Column(Numeric(10, 5), nullable=True)
    negative_prob = Column(Numeric(10, 5), nullable=True)
    
    model_name = Column(String(100), nullable=True)
    model_version = Column(String(100), nullable=True)
    sentiment_created_at = Column(DateTime, nullable=True)

class StockHistory(Base):
    __tablename__ = 'STOCK_HISTORY'
    
    stock_history_id = Column(BigInteger, primary_key=True, autoincrement=True)
    stock_code = Column(String(20), nullable=False)
    base_date = Column(DateTime, nullable=False)
    open_price = Column(Numeric(20, 2))
    high_price = Column(Numeric(20, 2))
    low_price = Column(Numeric(20, 2))
    close_price = Column(Numeric(20, 2))
    volume = Column(BigInteger)
