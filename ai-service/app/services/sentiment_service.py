import torch
import numpy as np
from datetime import datetime
from sqlalchemy.orm import Session
from loguru import logger
from app.db.models import Article
from app.registry.model_registry import registry
from typing import List

def clean_text_noise(text: str) -> str:
    if not text:
        return ""
    # Basic cleanup similar to colab script
    text = text.replace('\n', ' ').replace('\r', ' ')
    return text.strip()

def analyze_and_update_sentiment(db: Session, article_ids: List[int]):
    if not registry.sentiment_model or not registry.sentiment_tokenizer:
        logger.error("Sentiment model is not loaded.")
        raise ValueError("Sentiment model is not loaded.")
        
    model = registry.sentiment_model
    tokenizer = registry.sentiment_tokenizer
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    idx_to_label = {0: 'neutral', 1: 'positive', 2: 'negative'}
    BATCH_SIZE = 16
    MAX_SEQ_LEN = 512
    
    # Fetch articles
    articles = db.query(Article).filter(Article.article_id.in_(article_ids)).all()
    if not articles:
        return 0, 0
        
    success_count = 0
    
    final_input_texts = []
    for a in articles:
        summary_txt = clean_text_noise(a.summary)
        title_txt = clean_text_noise(a.title)
        
        if len(summary_txt) >= 5:
            final_input_texts.append(summary_txt)
        else:
            final_input_texts.append(title_txt if len(title_txt) > 0 else ".")
            
    all_probs = []
    
    with torch.no_grad():
        for i in range(0, len(final_input_texts), BATCH_SIZE):
            batch_texts = final_input_texts[i:i+BATCH_SIZE]
            encodings = tokenizer(
                batch_texts,
                max_length=MAX_SEQ_LEN,
                padding='max_length',
                truncation=True,
                return_tensors="pt"
            )
            encodings = {k: v.to(device) for k, v in encodings.items()}
            
            if torch.cuda.is_available():
                with torch.amp.autocast('cuda'):
                    logits = model(**encodings).logits
            else:
                logits = model(**encodings).logits
                
            probs = torch.softmax(logits.float(), dim=-1).cpu().numpy()
            all_probs.append(probs)
            
    if all_probs:
        probability_distributions = np.vstack(all_probs)
        neutral_probs = probability_distributions[:, 0]
        positive_probs = probability_distributions[:, 1]
        negative_probs = probability_distributions[:, 2]
        
        predicted_labels_idx = np.argmax(probability_distributions, axis=-1)
        sentiment_scores = positive_probs - negative_probs
        
        now_str = datetime.now()
        
        for idx, a in enumerate(articles):
            a.sentiment_label = idx_to_label[predicted_labels_idx[idx]]
            a.sentiment_score = float(np.round(sentiment_scores[idx], 4))
            a.positive_prob = float(np.round(positive_probs[idx], 4))
            a.neutral_prob = float(np.round(neutral_probs[idx], 4))
            a.negative_prob = float(np.round(negative_probs[idx], 4))
            a.model_name = "klue/bert-base"
            a.model_version = "best_klue_bert_model_v1"
            a.sentiment_created_at = now_str
            success_count += 1
            
        try:
            db.commit()
            logger.info(f"Successfully updated sentiment for {success_count} articles.")
        except Exception as e:
            db.rollback()
            logger.error(f"DB commit failed: {e}")
            raise e
            
    return success_count, len(articles) - success_count
