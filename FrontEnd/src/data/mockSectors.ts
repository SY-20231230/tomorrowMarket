export interface Sector {
  id: string;
  name: string;
  changeRate: number;
  outlook: string;
  companyCount: number;
  stocks: string[];
}

export const mockSectors: Sector[] = [
  {
    id: "it-semiconductor",
    name: "IT · 반도체",
    changeRate: 2.84,
    outlook: "AI 반도체 수요 폭증 및 업황 회복 가속화",
    companyCount: 6,
    stocks: ["삼성전자", "SK하이닉스", "삼성전자우", "리노공업", "한미반도체", "삼성전기"],
  },
  {
    id: "communication",
    name: "커뮤니케이션",
    changeRate: -0.52,
    outlook: "플랫폼 규제 우려 및 AI 서비스 경쟁 심화",
    companyCount: 2,
    stocks: ["NAVER", "카카오"],
  },
  {
    id: "materials",
    name: "소재",
    changeRate: 1.15,
    outlook: "이차전지 소재 공급망 재편 및 철강 수요 회복",
    companyCount: 6,
    stocks: ["POSCO홀딩스", "고려아연", "LG화학", "포스코푸처엠", "에코프로", "에코프로비엠"],
  },
  {
    id: "healthcare",
    name: "헬스케어",
    changeRate: 0.88,
    outlook: "바이오 시밀러 시장 확대 및 신약 파이프라인 기대",
    companyCount: 8,
    stocks: ["삼성바이오로직스", "셀트리온", "삼천당제약", "리가켐바이오", "알테오젠", "에이비엘바이오", "펩트론", "코오롱티슈진"],
  },
  {
    id: "finance",
    name: "금융",
    changeRate: 0.24,
    outlook: "금리 변동성 및 배당 성향 확대 기대",
    companyCount: 9,
    stocks: ["KB금융", "신한지주", "하나금융지주", "우리금융지주", "기업은행", "미래에셋증권", "메리츠금융지주", "삼성생명", "삼성화재"],
  },
  {
    id: "industrials",
    name: "산업재",
    changeRate: 1.42,
    outlook: "원전 수출 및 방산/건설 수주 모멘텀 지속",
    companyCount: 11,
    stocks: ["두산에너빌리티", "두산", "삼성물산", "현대건설", "현대로템", "HD현대중공업", "삼성중공업", "레인보우로보틱스", "한화시스템", "효성중공업", "SK"],
  },
  {
    id: "energy-utility",
    name: "에너지 · 유틸리티",
    changeRate: -0.35,
    outlook: "에너지 가격 변동성 및 탄소중립 정책 영향",
    companyCount: 7,
    stocks: ["LG에너지솔루션", "삼성SDI", "SK이노베이션", "한국전력", "LS ELECTRIC", "HD현대일렉트릭", "SK스퀘어"],
  },
  {
    id: "aerospace-marine",
    name: "항공 / 해양",
    changeRate: 2.15,
    outlook: "조선 업황 슈퍼사이클 진입 및 항공 여객 회복",
    companyCount: 6,
    stocks: ["HMM", "한화오션", "HD한국조선해양", "HD현대", "한화에어로스페이스", "한국항공우주"],
  },
  {
    id: "consumer-goods",
    name: "소비재",
    changeRate: 0.64,
    outlook: "자동차 수출 호조 및 내수 소비 패턴 변화",
    companyCount: 5,
    stocks: ["현대차", "기아", "현대모비스", "LG전자", "KT&G"],
  },
];