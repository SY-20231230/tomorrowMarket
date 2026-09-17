import os
import sys
import logging
from datetime import datetime, timedelta
import pandas as pd
import FinanceDataReader as fdr
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.config import settings
from app.db.session import SessionLocal
from app.db.models import StockHistory

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_active_stocks(db_session):
    """
    STOCKS 테이블에서 활성화된 60개 타겟 종목을 가져옵니다.
    """
    try:
        query = text("SELECT STOCK_CODE, STOCK_NAME FROM STOCKS WHERE IS_ACTIVE = True")
        result = db_session.execute(query).fetchall()
        return [{"stock_code": row[0], "stock_name": row[1]} for row in result]
    except Exception as e:
        logger.error(f"STOCKS 테이블 조회 중 에러 발생: {str(e)}")
        return []

def is_market_closed(target_date_str: str):
    """
    KOSPI(KS11) 지수 데이터를 조회하여 당일이 휴장일(주말/공휴일)인지 판별합니다.
    """
    try:
        df_kospi = fdr.DataReader('KS11', target_date_str, target_date_str)
        if df_kospi.empty:
            return True
        return False
    except Exception as e:
        logger.warning(f"휴장일 판별 중 에러 (일단 장이 열렸다고 가정): {str(e)}")
        return False

def get_previous_close(db_session, stock_code: str, target_date: datetime):
    """
    해당 종목의 대상일 이전 가장 최근 영업일의 종가를 쿼리합니다. (거래정지 종목 보정용)
    """
    try:
        recent_history = db_session.query(StockHistory)\
            .filter(StockHistory.stock_code == stock_code)\
            .filter(StockHistory.base_date < target_date)\
            .order_by(StockHistory.base_date.desc())\
            .first()
        
        if recent_history:
            return recent_history.close_price
        return 0
    except Exception as e:
        logger.error(f"전일 종가 조회 중 에러: {str(e)}")
        return 0

def fetch_and_save_stocks():
    db = SessionLocal()
    
    try:
        stocks = get_active_stocks(db)
        if not stocks:
            logger.warning("활성화된 종목이 없습니다. 스크립트를 종료합니다.")
            return
            
        today = datetime.now()
        target_date_str = today.strftime("%Y-%m-%d")
        
        # 1. 휴장일 체크
        if is_market_closed(target_date_str):
            logger.info(f"[{target_date_str}] 오늘은 휴장일(주말/공휴일)이므로 주가 수집을 건너뜁니다.")
            return
            
        logger.info(f"[{target_date_str}] 총 {len(stocks)}개 종목 당일 OHLCV 수집을 시작합니다.")
        
        saved_count = 0
        target_datetime = datetime.strptime(target_date_str, "%Y-%m-%d")
        
        for stock in stocks:
            stock_code = stock['stock_code']
            stock_name = stock['stock_name']
            
            # 중복 적재 방지 (멱등성 보장)
            existing = db.query(StockHistory)\
                .filter(StockHistory.stock_code == stock_code)\
                .filter(StockHistory.base_date == target_datetime)\
                .first()
                
            if existing:
                logger.debug(f"{stock_name}({stock_code})의 오늘 데이터가 이미 존재합니다.")
                continue
                
            try:
                # FinanceDataReader 로 당일 주가 1row 조회
                df = fdr.DataReader(stock_code, target_date_str, target_date_str)
                
                if df.empty:
                    logger.warning(f"[{stock_name}] 당일 데이터가 비어있습니다. 상장폐지 또는 지연을 의심하세요.")
                    continue
                    
                row = df.iloc[-1]
                open_p = float(row['Open'])
                high_p = float(row['High'])
                low_p = float(row['Low'])
                close_p = float(row['Close'])
                volume = int(row['Volume'])
                
                # 2. 거래 정지 종목 방어 (거래량이 0인 경우)
                if volume == 0:
                    prev_close = get_previous_close(db, stock_code, target_datetime)
                    if prev_close > 0:
                        logger.info(f"[{stock_name}] 거래정지 감지! 전일 종가({prev_close}원)로 OHLC 가격을 강제 보정합니다.")
                        open_p = float(prev_close)
                        high_p = float(prev_close)
                        low_p = float(prev_close)
                        close_p = float(prev_close)
                
                # 3. 모델 매핑 및 적재
                new_history = StockHistory(
                    stock_code=stock_code,
                    base_date=target_datetime,
                    open_price=open_p,
                    high_price=high_p,
                    low_price=low_p,
                    close_price=close_p,
                    volume=volume
                )
                db.add(new_history)
                saved_count += 1
                
            except Exception as e:
                logger.error(f"[{stock_name}] 수집/처리 중 예외 발생: {str(e)}")
                
        # 트랜잭션 커밋
        if saved_count > 0:
            db.commit()
            logger.info(f"✅ 주가 수집 성공: 총 {saved_count}건의 종목 OHLCV가 DB에 적재되었습니다.")
        else:
            logger.info("새로 적재할 데이터가 없습니다.")
            
    except Exception as e:
        logger.error(f"주가 수집기 실행 중 치명적 에러 발생: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fetch_and_save_stocks()
