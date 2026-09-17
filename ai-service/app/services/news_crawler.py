import os
import sys
import json
import logging
import re
import html
import time
from datetime import datetime
import requests
from bs4 import BeautifulSoup
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.config import settings
from app.db.session import SessionLocal
from app.db.models import Article

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==============================================================================
# [1] 9개 산업군 대분류, 60개 종목코드 및 검색어 쿼리 맵핑 정의
# ==============================================================================
TARGET_COUNT_PER_STOCK = 100  # 종목당 수집 목표 건수

STOCK_MASTER_META = {
    # 1. IT·반도체 (6개)
    "삼성전자": {"symbol": "005930", "industry": "IT·반도체"},
    "SK하이닉스": {"symbol": "000660", "industry": "IT·반도체"},
    "삼성전자우": {"symbol": "005935", "industry": "IT·반도체"},
    "리노공업": {"symbol": "058470", "industry": "IT·반도체"},
    "한미반도체": {"symbol": "042700", "industry": "IT·반도체"},
    "삼성전기": {"symbol": "009150", "industry": "IT·반도체"},
    
    # 2. 커뮤니케이션 (2개)
    "NAVER": {"symbol": "035420", "industry": "커뮤니케이션"},
    "카카오": {"symbol": "035720", "industry": "커뮤니케이션"},
    
    # 3. 소재 (6개)
    "POSCO홀딩스": {"symbol": "005490", "industry": "소재"},
    "고려아연": {"symbol": "010130", "industry": "소재"},
    "LG화학": {"symbol": "051910", "industry": "소재"},
    "포스코퓨처엠": {"symbol": "003670", "industry": "소재"},
    "에코프로": {"symbol": "086520", "industry": "소재"},
    "에코프로비엠": {"symbol": "247540", "industry": "소재"},
    
    # 4. 헬스케어 (8개)
    "삼성바이오로직스": {"symbol": "207940", "industry": "헬스케어"},
    "셀트리온": {"symbol": "068270", "industry": "헬스케어"},
    "삼천당제약": {"symbol": "000250", "industry": "헬스케어"},
    "리가켐바이오": {"symbol": "141080", "industry": "헬스케어"},
    "알테오젠": {"symbol": "196170", "industry": "헬스케어"},
    "에이비엘바이오": {"symbol": "298380", "industry": "헬스케어"},
    "펩트론": {"symbol": "087010", "industry": "헬스케어"},
    "코오롱티슈진": {"symbol": "950160", "industry": "헬스케어"},
    
    # 5. 금융 (9개)
    "KB금융": {"symbol": "105560", "industry": "금융"},
    "신한지주": {"symbol": "055550", "industry": "금융"},
    "하나금융지주": {"symbol": "086790", "industry": "금융"},
    "우리금융지주": {"symbol": "316140", "industry": "금융"},
    "기업은행": {"symbol": "024110", "industry": "금융"},
    "미래에셋증권": {"symbol": "006800", "industry": "금융"},
    "메리츠금융지주": {"symbol": "138040", "industry": "금융"},
    "삼성생명": {"symbol": "032830", "industry": "금융"},
    "삼성화재": {"symbol": "000810", "industry": "금융"},
    
    # 6. 산업재 (11개)
    "두산에너빌리티": {"symbol": "034020", "industry": "산업재"},
    "두산": {"symbol": "000150", "industry": "산업재"},
    "삼성물산": {"symbol": "028260", "industry": "산업재"},
    "현대건설": {"symbol": "000720", "industry": "산업재"},
    "현대로템": {"symbol": "064350", "industry": "산업재"},
    "HD현대중공업": {"symbol": "329180", "industry": "산업재"},
    "삼성중공업": {"symbol": "010140", "industry": "산업재"},
    "레인보우로보틱스": {"symbol": "277810", "industry": "산업재"},
    "한화시스템": {"symbol": "272210", "industry": "산업재"},
    "효성중공업": {"symbol": "298040", "industry": "산업재"},
    "SK": {"symbol": "034730", "industry": "산업재"},
    
    # 7. 에너지·유틸리티 (7개)
    "LG에너지솔루션": {"symbol": "373220", "industry": "에너지·유틸리티"},
    "삼성SDI": {"symbol": "006400", "industry": "에너지·유틸리티"},
    "SK이노베이션": {"symbol": "096770", "industry": "에너지·유틸리티"},
    "한국전력": {"symbol": "015760", "industry": "에너지·유틸리티"},
    "LS ELECTRIC": {"symbol": "010120", "industry": "에너지·유틸리티"},
    "HD현대일렉트릭": {"symbol": "267260", "industry": "에너지·유틸리티"},
    "SK스퀘어": {"symbol": "402340", "industry": "에너지·유틸리티"},
    
    # 8. 항공 / 해양 (6개)
    "HMM": {"symbol": "011200", "industry": "항공 / 해양"},
    "한화오션": {"symbol": "042660", "industry": "항공 / 해양"},
    "HD한국조선해양": {"symbol": "009540", "industry": "항공 / 해양"},
    "HD현대": {"symbol": "267250", "industry": "항공 / 해양"},
    "한화에어로스페이스": {"symbol": "012450", "industry": "항공 / 해양"},
    "한국항공우주": {"symbol": "047810", "industry": "항공 / 해양"},
    
    # 9. 소비재 (5개)
    "현대차": {"symbol": "005380", "industry": "소비재"},
    "기아": {"symbol": "000270", "industry": "소비재"},
    "현대모비스": {"symbol": "012330", "industry": "소비재"},
    "LG전자": {"symbol": "066570", "industry": "소비재"},
    "KT&G": {"symbol": "033780", "industry": "소비재"}
}

# 네이버 뉴스 검색용 쿼리 맵핑
NAVER_QUERY_MAP = {
    "삼성전자": "삼성전자 | 005930 | 삼성전자주식회사",
    "SK하이닉스": "SK하이닉스 | 000660 | 하이닉스 | 하이닉스반도체",
    "삼성전자우": "삼성전자우 | 005935 | 삼성전자우선주",
    "리노공업": "리노공업 | 058470 | LEENO",
    "한미반도체": "한미반도체 | 042700 | HANMI",
    "삼성전기": "삼성전기 | 009150 | SEMCO",
    "NAVER": "NAVER | 035420 | 네이버",
    "카카오": "카카오 | 035720 | kakao",
    "POSCO홀딩스": "POSCO홀딩스 | 005490 | 포스코홀딩스 | 포스코",
    "고려아연": "고려아연 | 010130 | Korea Zinc",
    "LG화학": "LG화학 | 051910 | LG Chem",
    "포스코퓨처엠": "포스코퓨처엠 | 003670 | 포스코케미칼",
    "에코프로": "에코프로 | 086520 | EcoPro",
    "에코프로비엠": "에코프로비엠 | 247540 | EcoPro BM",
    "삼성바이오로직스": "삼성바이오로직스 | 207940 | 삼바 | 삼성바이오",
    "셀트리온": "셀트리온 | 068270 | Celltrion",
    "삼천당제약": "삼천당제약 | 000250 | Samchundang",
    "리가켐바이오": "리가켐바이오 | 141080 | 레고켐바이오 | 리가켐바이오사이언스",
    "알테오젠": "알테오젠 | 196170 | Alteogen",
    "에이비엘바이오": "에이비엘바이오 | 298380 | ABL Bio",
    "펩트론": "펩트론 | 087010 | Peptron | 스마트디포",
    "코오롱티슈진": "코오롱티슈진 | 950160 | 인보사",
    "KB금융": "KB금융 | 105560 | KB금융지주",
    "신한지주": "신한지주 | 055550 | 신한금융지주 | 신한금융",
    "하나금융지주": "하나금융지주 | 086790 | 하나금융",
    "우리금융지주": "우리금융지주 | 316140 | 우리금융",
    "기업은행": "기업은행 | 024110 | IBK기업은행",
    "미래에셋증권": "미래에셋증권 | 006800 | 미래에셋대우",
    "메리츠금융지주": "메리츠금융지주 | 138040 | 메리츠금융",
    "삼성생명": "삼성생명 | 032830 | 삼성생명보험",
    "삼성화재": "삼성화재 | 000810 | 삼성화재해상보험",
    "두산에너빌리티": "두산에너빌리티 | 034020 | 두산중공업",
    "두산": "두산 | 000150 | Doosan",
    "삼성물산": "삼성물산 | 028260 | 삼성물산주식회사",
    "현대건설": "현대건설 | 000720",
    "현대로템": "현대로템 | 064350",
    "HD현대중공업": "HD현대중공업 | 329180",
    "삼성중공업": "삼성중공업 | 010140",
    "레인보우로보틱스": "레인보우로보틱스 | 277810",
    "한화시스템": "한화시스템 | 272210",
    "효성중공업": "효성중공업 | 298040",
    "SK": "SK | 034730 | SK주식회사",
    "LG에너지솔루션": "LG에너지솔루션 | 373220",
    "삼성SDI": "삼성SDI | 006400",
    "SK이노베이션": "SK이노베이션 | 096770",
    "한국전력": "한국전력 | 015760 | 한전",
    "LS ELECTRIC": "LSELECTRIC | LS ELECTRIC | 010120 | LS산전",
    "HD현대일렉트릭": "HD현대일렉트릭 | 267260",
    "SK스퀘어": "SK스퀘어 | 402340",
    "HMM": "HMM | 011200 | 현대상선",
    "한화오션": "한화오션 | 042660 | 대우조선해양",
    "HD한국조선해양": "HD한국조선해양 | 009540",
    "HD현대": "HD현대 | 267250 | 현대중공업지주",
    "한화에어로스페이스": "한화에어로스페이스 | 012450",
    "한국항공우주": "한국항공우주 | 047810 | KAI",
    "현대차": "현대차 | 현대자동차 | 005380",
    "기아": "기아 | 기아차 | 000270",
    "현대모비스": "현대모비스 | 012330",
    "LG전자": "LG전자 | 066570",
    "KT&G": "KT&G | 케이티앤지 | 033780"
}

# ==============================================================================
# [2] 전처리 헬퍼 함수 및 고성능 네이버 뉴스 파서
# ==============================================================================
def clean_html_tags(text):
    if not isinstance(text, str):
        return ""
    text = html.unescape(text)
    text = re.sub(r'<[^>]+>', '', text)
    return re.sub(r'\s+', ' ', text).strip()

def parse_rfc822_date(date_str):
    try:
        dt = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S +0900")
        return dt
    except Exception:
        return datetime.now()

def extract_article_keywords(text, top_n=10):
    clean_text = re.sub(r'[^가-힣a-zA-Z0-9\s]', ' ', str(text))
    tokens = clean_text.split()
    stopwords = {
        "있다", "했다", "밝혔다", "것으로", "기자", "지난", "통해", "위해", 
        "대해", "따르면", "전망이다", "관련", "이번", "대한", "전년", "올해"
    }
    words = [w for w in tokens if len(w) >= 2 and w not in stopwords]
    freq = {}
    for w in words:
        freq[w] = freq.get(w, 0) + 1
    sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return ",".join([w for w, _ in sorted_words[:top_n]])

def parse_naver_news_page(url, fallback_summary="", article_title=""):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code != 200:
            return None

        soup = BeautifulSoup(resp.text, 'html.parser')

        # 언론사명 추출
        media = ""
        media_img = soup.find('img', class_='media_end_head_top_logo_img')
        if media_img:
            media = media_img.get('alt', '').strip() or media_img.get('title', '').strip()
        if not media:
            media_tag = soup.select_one("span.media_end_head_top_press")
            if media_tag:
                media = media_tag.get_text(strip=True)
        if not media:
            meta_press = soup.find("meta", property="og:article:author")
            if meta_press:
                media = meta_press.get("content", "").strip()
        if not media:
            media = "네이버뉴스"

        # 기사 요약문 추출
        summary = ""
        summary_tag = soup.select_one("strong.media_end_summary")
        if summary_tag and len(summary_tag.get_text(strip=True)) > 10:
            summary = summary_tag.get_text(separator=" ", strip=True)
        else:
            summary = fallback_summary

        # 본문 텍스트 추출
        content = ""
        content_area = soup.select_one("#dic_area, #newsct_article")
        if content_area:
            for noise in content_area.select("span.end_photo_org, em.img_desc, script, style"):
                noise.decompose()
            content = content_area.get_text(separator=" ", strip=True)
        else:
            content = summary

        # 기자명 파이프라인
        reporter = ""
        meta_dable = soup.find("meta", {"name": "dable:author"}) or soup.find("meta", property="dable:author")
        if meta_dable and meta_dable.get("content"):
            d_val = meta_dable.get("content").strip()
            if d_val and d_val != media and len(d_val) <= 15:
                m_auth = re.search(r'([가-힣]{2,4})', d_val)
                if m_auth:
                    reporter = f"{m_auth.group(1)} 기자"

        if not reporter and content:
            m_email_rep = re.search(r'([가-힣]{2,4})\s*기자\s*\([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\)', content)
            if m_email_rep:
                reporter = f"{m_email_rep.group(1)} 기자"
            else:
                m_plain_email = re.search(r'([가-힣]{2,4})\s+[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', content)
                if m_plain_email:
                    cand = m_plain_email.group(1).strip()
                    if cand not in ["무단", "전재", "배포", "금지", "저작권", "출처"]:
                        reporter = f"{cand} 기자"

        if not reporter and content:
            m_bracket = re.search(r'\[(?:[^\]]*?\s+)?([가-힣]{2,4})\s*기자(?:[^\]]*)?\]', content)
            if m_bracket:
                reporter = f"{m_bracket.group(1)} 기자"
            else:
                m_general = re.search(r'([가-힣]{2,4})\s*기자', content)
                if m_general:
                    cand_gen = m_general.group(1).strip()
                    if cand_gen not in ["해당", "어느", "전문", "현직", "소속", "뉴스", "사진"]:
                        reporter = f"{cand_gen} 기자"

        if not reporter:
            reporter = f"{media} 기자"

        return {
            "media": media,
            "reporter": reporter,
            "summary": clean_html_tags(summary),
            "content": clean_html_tags(content)
        }
    except Exception:
        return None


# ==============================================================================
# [3] 메인 파이프라인 가동 (NAVER API HUB 호출 및 DB 적재)
# ==============================================================================
def run_crawler():
    API_ENDPOINT = 'https://naverapihub.apigw.ntruss.com/search/v1/news'
    API_HEADERS = {
        'X-NCP-APIGW-API-KEY-ID': settings.NCP_CLIENT_ID.strip(),
        'X-NCP-APIGW-API-KEY': settings.NCP_CLIENT_SECRET.strip(),
    }
    
    db = SessionLocal()
    new_article_ids = []
    
    try:
        logger.info(f"[SYSTEM] 60개 종목 뉴스 정밀 크롤링을 시작합니다.")
        
        for stock_name, meta_info in STOCK_MASTER_META.items():
            symbol_code = meta_info['symbol']
            industry_name = meta_info['industry']
            query = NAVER_QUERY_MAP.get(stock_name, stock_name)
            
            logger.info(f"[{stock_name}] 기사 수집 중...")
            
            valid_articles_count = 0
            start_index = 1
            display_limit = 100
            
            while valid_articles_count < TARGET_COUNT_PER_STOCK and start_index <= 1000:
                params = {
                    "query": query,
                    "display": display_limit,
                    "start": start_index,
                    "sort": "date",
                    "format": "json"
                }
                
                response = requests.get(API_ENDPOINT, headers=API_HEADERS, params=params, timeout=10)
                if response.status_code != 200:
                    logger.error(f"[API 응답 에러] {stock_name}: {response.status_code}")
                    break
                    
                data = response.json()
                items = data.get('items', [])
                
                if not items:
                    break
                    
                for item in items:
                    if valid_articles_count >= TARGET_COUNT_PER_STOCK:
                        break
                        
                    naver_url = item.get('link', '').strip()
                    if "news.naver.com" not in naver_url:
                        continue
                        
                    # 중복 기사 검증 (URL 기준)
                    existing = db.query(Article).filter(Article.url == naver_url).first()
                    if existing:
                        continue
                        
                    clean_title = clean_html_tags(item.get('title', ''))
                    clean_summary = clean_html_tags(item.get('description', ''))
                    pub_date = parse_rfc822_date(item.get('pubDate', ''))
                    
                    parsed_data = parse_naver_news_page(
                        url=naver_url, 
                        fallback_summary=clean_summary, 
                        article_title=clean_title
                    )
                    
                    if not parsed_data or len(parsed_data.get('content', '')) < 30:
                        continue
                        
                    keyword_source_text = f"{clean_title} {parsed_data['content'][:500]}"
                    extracted_keywords = extract_article_keywords(keyword_source_text, top_n=10)
                    
                    new_article = Article(
                        news_date=pub_date.replace(tzinfo=None),
                        media=parsed_data['media'],
                        reporter=parsed_data['reporter'],
                        title=clean_title,
                        summary=parsed_data['summary'],
                        content=parsed_data['content'],
                        url=naver_url,
                        symbol=symbol_code,
                        stock_name=stock_name,
                        industry=industry_name,
                        search_keyword=query,
                        keywords=extracted_keywords
                    )
                    
                    db.add(new_article)
                    db.commit()
                    db.refresh(new_article)
                    new_article_ids.append(new_article.article_id)
                    valid_articles_count += 1
                    
                    time.sleep(0.08)  # 네이버 서버 과부하 방지 지연
                    
                start_index += display_limit
                
        logger.info(f"크롤링 완료: 총 {len(new_article_ids)}개의 신규 기사가 DB에 성공적으로 적재되었습니다.")
        
        # 4. 백엔드로 Webhook 발송
        if settings.BACKEND_WEBHOOK_URL and new_article_ids:
            try:
                resp = requests.post(
                    settings.BACKEND_WEBHOOK_URL,
                    json={"article_ids": new_article_ids, "status": "COMPLETED"},
                    timeout=5
                )
                logger.info(f"백엔드 Webhook 발송 완료 (Status: {resp.status_code})")
            except Exception as e:
                logger.error(f"백엔드 Webhook 발송 실패: {str(e)}")
                
    except Exception as e:
        logger.error(f"크롤러 실행 중 치명적 에러 발생: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_crawler()
