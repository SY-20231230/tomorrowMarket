import os
from loguru import logger
from app.db.session import SessionLocal
from app.db.models import Article
from app.registry.model_registry import registry
from app.services.sentiment_service import analyze_and_update_sentiment

def run_sentiment_batch():
    logger.info("Starting Sentiment Analysis Batch Job...")
    
    # 1. 모델 초기화 (감성 분석 모델만 로드)
    # registry.initialize() 를 호출하면 전체 모델을 로드하므로, 메모리 효율을 위해 감성 분석만 직접 호출
    registry._load_sentiment_model()
    
    if not registry.sentiment_model:
        logger.error("Failed to load sentiment model. Aborting batch job.")
        return

    db = SessionLocal()
    try:
        # 2. 감성 점수가 계산되지 않은(sentiment_label 이 null 인) 기사 조회
        # 배치 사이즈 조절 (예: 한 번에 1000개씩)
        unprocessed_articles = db.query(Article.article_id).filter(Article.sentiment_label.is_(None)).limit(1000).all()
        
        if not unprocessed_articles:
            logger.info("No unprocessed articles found. Batch job finished.")
            return

        article_ids = [a.article_id for a in unprocessed_articles]
        logger.info(f"Found {len(article_ids)} articles to process.")
        
        # 3. 감성 분석 수행 및 DB 저장
        success, failed = analyze_and_update_sentiment(db, article_ids)
        
        logger.info(f"Batch job complete. Success: {success}, Failed: {failed}")

    except Exception as e:
        logger.error(f"Error during sentiment batch job: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    run_sentiment_batch()
