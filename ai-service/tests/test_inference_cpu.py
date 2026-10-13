import torch
import pandas as pd
import numpy as np
from app.registry.model_registry import registry

print("1. Initializing registry...")
registry.initialize()

print("\n2. Testing KLUE-BERT Sentiment Inference on CPU...")
tokenizer = registry.sentiment_tokenizer
bert_model = registry.sentiment_model
test_text = "삼성전자 3분기 영업이익 어닝 서프라이즈 달성 호재"
inputs = tokenizer([test_text], padding=True, truncation=True, max_length=128, return_tensors="pt")
with torch.no_grad():
    outputs = bert_model(**inputs)
    probs = torch.softmax(outputs.logits, dim=1).numpy()[0]
idx_to_label = {0: "neutral", 1: "positive", 2: "negative"}
pred_label = idx_to_label[np.argmax(probs)]
print(f"Sentiment Result: {pred_label} (Probs: {probs})")

print("\n3. Testing LightGBM Inference on CPU...")
lgb = registry.get_lightgbm_model("Aviation", "SHORT")
features = registry.get_features("Aviation", "SHORT")
print(f"Features count: {len(features)}")
dummy_input = pd.DataFrame([np.zeros(len(features))], columns=features)
lgb_pred = lgb.predict(dummy_input)
print(f"LightGBM Aviation SHORT prediction output shape: {lgb_pred.shape}")
print(f"LightGBM prediction values: {lgb_pred}")

print("\n4. Testing TFT Model Evaluation on CPU...")
tft = registry.get_tft_model("Aviation", "SHORT")
print(f"TFT model object: {type(tft)}")
print(f"TFT training mode: {tft.training}")
param_count = sum(p.numel() for p in tft.parameters())
print(f"TFT total parameter count: {param_count:,}")

print("\n=== ALL INFERENCE TESTS PASSED ON CPU! ===")
