import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import time
import psutil

def get_mem_info():
    proc = psutil.Process()
    mem = proc.memory_info()
    return {
        "rss_mb": mem.rss / (1024 * 1024),
        "vms_mb": mem.vms / (1024 * 1024)
    }

if __name__ == '__main__':
    proc = psutil.Process()
    print("=== [TomorrowMarket AI Server 메모리 실측 테스트] ===")
    
    init_mem = get_mem_info()
    print(f"1. 프로세스 시작 메모리: RSS = {init_mem['rss_mb']:.2f} MB, VMS = {init_mem['vms_mb']:.2f} MB")
    
    from app.registry.model_registry import ModelRegistry
    registry = ModelRegistry()
    
    # 1) LightGBM 로딩
    t0 = time.time()
    registry._load_lightgbm_models()
    t_lgb = time.time()
    lgb_mem = get_mem_info()
    print(f"2. LightGBM 18개 로딩 후: RSS = {lgb_mem['rss_mb']:.2f} MB (+{lgb_mem['rss_mb'] - init_mem['rss_mb']:.2f} MB), 소요시간: {t_lgb - t0:.2f}초")
    
    # 2) TFT 로딩
    registry._load_tft_models()
    t_tft = time.time()
    tft_mem = get_mem_info()
    print(f"3. TFT 18개 로딩 후: RSS = {tft_mem['rss_mb']:.2f} MB (+{tft_mem['rss_mb'] - lgb_mem['rss_mb']:.2f} MB), 소요시간: {t_tft - t_lgb:.2f}초")
    
    # 3) Sentiment 로딩
    registry._load_sentiment_model()
    t_sent = time.time()
    sent_mem = get_mem_info()
    print(f"4. KLUE-BERT 로딩 후: RSS = {sent_mem['rss_mb']:.2f} MB (+{sent_mem['rss_mb'] - tft_mem['rss_mb']:.2f} MB), 소요시간: {t_sent - t_tft:.2f}초")
    
    print("\n=== [최종 결과 요약] ===")
    status = registry.get_model_status()
    print(f"- LightGBM 로딩: {status['lightgbm_count']} / 18")
    print(f"- TFT 로딩: {status['tft_count']} / 18")
    print(f"- Sentiment 로딩: {status['sentiment_loaded']}")
    print(f"- 로딩 에러 수: {len(status['loading_errors'])}")
    print(f"- 총 소요시간: {t_sent - t0:.2f}초")
    print(f"- 최종 RAM (RSS) 사용량: {sent_mem['rss_mb']:.2f} MB")
    print(f"- 순수 모델 로딩으로 증가한 RAM: {sent_mem['rss_mb'] - init_mem['rss_mb']:.2f} MB")
    print(f"- 가상 메모리 (VMS): {sent_mem['vms_mb']:.2f} MB")
