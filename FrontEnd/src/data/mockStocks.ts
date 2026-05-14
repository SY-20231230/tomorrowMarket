export interface Stock {
  code: string;
  name: string;
  price: number;
  changeRate: number;
  volume: number;
  prediction: string;
  market: "KOSPI" | "KOSDAQ";
}

export const mockStocks: Stock[] = [
  // --- KOSDAQ (10개) ---
  { code: "277810", name: "레인보우로보틱스", price: 175200, changeRate: 1.45, volume: 850000, prediction: "긍정", market: "KOSDAQ" },
  { code: "141080", name: "리가켐바이오", price: 72100, changeRate: -0.82, volume: 420000, prediction: "부정", market: "KOSDAQ" },
  { code: "058470", name: "리노공업", price: 254000, changeRate: 2.14, volume: 150000, prediction: "긍정", market: "KOSDAQ" },
  { code: "000250", name: "삼천당제약", price: 112000, changeRate: 3.52, volume: 680000, prediction: "긍정", market: "KOSDAQ" },
  { code: "196170", name: "알테오젠", price: 184500, changeRate: 0.92, volume: 920000, prediction: "긍정", market: "KOSDAQ" },
  { code: "298380", name: "에이비엘바이오", price: 24500, changeRate: -1.25, volume: 310000, prediction: "부정", market: "KOSDAQ" },
  { code: "086520", name: "에코프로", price: 102400, changeRate: -2.14, volume: 2150000, prediction: "부정", market: "KOSDAQ" },
  { code: "247540", name: "에코프로비엠", price: 231500, changeRate: -1.84, volume: 1840000, prediction: "부정", market: "KOSDAQ" },
  { code: "950160", name: "코오롱티슈진", price: 14200, changeRate: 0.00, volume: 0, prediction: "긍정", market: "KOSDAQ" },
  { code: "087010", name: "펩트론", price: 38400, changeRate: 1.15, volume: 450000, prediction: "긍정", market: "KOSDAQ" },

  // --- KOSPI (50개) ---
  { code: "010130", name: "고려아연", price: 482000, changeRate: 0.42, volume: 85000, prediction: "긍정", market: "KOSPI" },
  { code: "024110", name: "기업은행", price: 13800, changeRate: 0.42, volume: 2100000, prediction: "긍정", market: "KOSPI" },
  { code: "000270", name: "기아", price: 114200, changeRate: 1.12, volume: 1250000, prediction: "긍정", market: "KOSPI" },
  { code: "035420", name: "NAVER", price: 214000, changeRate: -1.28, volume: 1250000, prediction: "부정", market: "KOSPI" },
  { code: "000150", name: "두산", price: 154200, changeRate: 1.25, volume: 320000, prediction: "긍정", market: "KOSPI" },
  { code: "034020", name: "두산에너빌리티", price: 18420, changeRate: 2.14, volume: 12450000, prediction: "긍정", market: "KOSPI" },
  { code: "006800", name: "미래에셋증권", price: 8420, changeRate: 0.25, volume: 4200000, prediction: "긍정", market: "KOSPI" },
  { code: "138040", name: "메리츠금융지주", price: 78400, changeRate: 3.12, volume: 840000, prediction: "긍정", market: "KOSPI" },
  { code: "005930", name: "삼성전자", price: 83200, changeRate: 2.15, volume: 18452000, prediction: "긍정", market: "KOSPI" },
  { code: "005935", name: "삼성전자우", price: 68400, changeRate: 1.52, volume: 2100000, prediction: "긍정", market: "KOSPI" },
  { code: "207940", name: "삼성바이오로직스", price: 812000, changeRate: 1.24, volume: 120000, prediction: "긍정", market: "KOSPI" },
  { code: "028260", name: "삼성물산", price: 148500, changeRate: 0.42, volume: 650000, prediction: "긍정", market: "KOSPI" },
  { code: "006400", name: "삼성SDI", price: 412000, changeRate: -0.84, volume: 420000, prediction: "부정", market: "KOSPI" },
  { code: "032830", name: "삼성생명", price: 92400, changeRate: 1.14, volume: 450000, prediction: "긍정", market: "KOSPI" },
  { code: "000810", name: "삼성화재", price: 312000, changeRate: 0.84, volume: 120000, prediction: "긍정", market: "KOSPI" },
  { code: "009150", name: "삼성전기", price: 154200, changeRate: 0.84, volume: 840000, prediction: "긍정", market: "KOSPI" },
  { code: "010140", name: "삼성중공업", price: 8420, changeRate: 1.14, volume: 15400000, prediction: "긍정", market: "KOSPI" },
  { code: "068270", name: "셀트리온", price: 184200, changeRate: 0.72, volume: 1450000, prediction: "긍정", market: "KOSPI" },
  { code: "055550", name: "신한지주", price: 48200, changeRate: 1.84, volume: 2100000, prediction: "긍정", market: "KOSPI" },
  { code: "034730", name: "SK", price: 178500, changeRate: 0.42, volume: 420000, prediction: "긍정", market: "KOSPI" },
  { code: "000660", name: "SK하이닉스", price: 181500, changeRate: 3.42, volume: 9321000, prediction: "긍정", market: "KOSPI" },
  { code: "373220", name: "LG에너지솔루션", price: 374500, changeRate: -1.24, volume: 840000, prediction: "부정", market: "KOSPI" },
  { code: "096770", name: "SK이노베이션", price: 112400, changeRate: -0.52, volume: 1250000, prediction: "부정", market: "KOSPI" },
  { code: "402340", name: "SK스퀘어", price: 78400, changeRate: 1.15, volume: 840000, prediction: "긍정", market: "KOSPI" },
  { code: "010120", name: "LS ELECTRIC", price: 214500, changeRate: 3.12, volume: 840000, prediction: "긍정", market: "KOSPI" },
  { code: "051910", name: "LG화학", price: 421000, changeRate: 0.84, volume: 870000, prediction: "긍정", market: "KOSPI" },
  { code: "066570", name: "LG전자", price: 102400, changeRate: -0.84, volume: 1840000, prediction: "부정", market: "KOSPI" },
  { code: "316140", name: "우리금융지주", price: 14200, changeRate: 0.84, volume: 5400000, prediction: "긍정", market: "KOSPI" },
  { code: "035720", name: "카카오", price: 52100, changeRate: -0.92, volume: 3200000, prediction: "부정", market: "KOSPI" },
  { code: "033780", name: "KT&G", price: 92400, changeRate: 0.42, volume: 650000, prediction: "긍정", market: "KOSPI" },
  { code: "105560", name: "KB금융", price: 72100, changeRate: 2.54, volume: 3200000, prediction: "긍정", market: "KOSPI" },
  { code: "005490", name: "POSCO홀딩스", price: 398000, changeRate: 1.15, volume: 950000, prediction: "긍정", market: "KOSPI" },
  { code: "003670", name: "포스코퓨처엠", price: 284000, changeRate: -0.52, volume: 420000, prediction: "부정", market: "KOSPI" },
  { code: "086790", name: "하나금융지주", price: 54200, changeRate: 1.25, volume: 1850000, prediction: "긍정", market: "KOSPI" },
  { code: "042700", name: "한미반도체", price: 142500, changeRate: 4.12, volume: 1250000, prediction: "긍정", market: "KOSPI" },
  { code: "000720", name: "현대건설", price: 34200, changeRate: -0.84, volume: 1850000, prediction: "부정", market: "KOSPI" },
  { code: "064350", name: "현대로템", price: 42100, changeRate: 1.45, volume: 2150000, prediction: "긍정", market: "KOSPI" },
  { code: "329180", name: "HD현대중공업", price: 134200, changeRate: 2.84, volume: 420000, prediction: "긍정", market: "KOSPI" },
  { code: "272210", name: "한화시스템", price: 18450, changeRate: 0.92, volume: 1250000, prediction: "긍정", market: "KOSPI" },
  { code: "298040", name: "효성중공업", price: 312000, changeRate: 4.52, volume: 245000, prediction: "긍정", market: "KOSPI" },
  { code: "015760", name: "한국전력", price: 21400, changeRate: 0.42, volume: 3200000, prediction: "긍정", market: "KOSPI" },
  { code: "267260", name: "HD현대일렉트릭", price: 242000, changeRate: 5.24, volume: 420000, prediction: "긍정", market: "KOSPI" },
  { code: "011200", name: "HMM", price: 18420, changeRate: -0.42, volume: 4250000, prediction: "부정", market: "KOSPI" },
  { code: "042660", name: "한화오션", price: 31200, changeRate: 1.84, volume: 2150000, prediction: "긍정", market: "KOSPI" },
  { code: "009540", name: "HD한국조선해양", price: 132400, changeRate: 2.14, volume: 420000, prediction: "긍정", market: "KOSPI" },
  { code: "267250", name: "HD현대", price: 68400, changeRate: 0.52, volume: 210000, prediction: "긍정", market: "KOSPI" },
  { code: "012450", name: "한화에어로스페이스", price: 214500, changeRate: 3.42, volume: 920000, prediction: "긍정", market: "KOSPI" },
  { code: "047810", name: "한국항공우주", price: 54200, changeRate: 0.84, volume: 1250000, prediction: "긍정", market: "KOSPI" },
  { code: "005380", name: "현대차", price: 245000, changeRate: 1.45, volume: 850000, prediction: "긍정", market: "KOSPI" },
  { code: "012330", name: "현대모비스", price: 231500, changeRate: 0.52, volume: 420000, prediction: "긍정", market: "KOSPI" },
  { code: "006800", name: "미래에셋증권", price: 8420, changeRate: 0.12, volume: 2450000, prediction: "긍정", market: "KOSPI" }
];