export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  time: string;
  thumbnail: string;
  tags: string[];
  category: string;
  sentiment: "positive" | "negative" | "neutral";
  sentimentScore: number;
  impact: "HIGH" | "MEDIUM" | "LOW";
}

export const mockNews: NewsItem[] = [
  {
    id: 1, title: "엔비디아 실적 호조에 국내 AI 반도체 관련주 강세", 
    summary: "엔비디아의 실적이 시장 예상치를 상회하며 AI 반도체 수요 기대감이 커지고 있습니다. 국내 관련 기업들의 주가도 동반 상승세를 보이고 있습니다.",
    source: "한국경제", time: "5분 전", thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500",
    tags: ["반도체", "AI", "엔비디아"], category: "산업", sentiment: "positive", sentimentScore: 85, impact: "HIGH"
  },
  {
    id: 2, title: "연준 인사들이 금리 인하 가능성 시사", 
    summary: "연준 주요 인사들이 경제 상황을 고려할 때 올해 금리 인하가 적절할 수 있다는 발언을 이어가고 있습니다.",
    source: "연합뉴스", time: "25분 전", thumbnail: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500",
    tags: ["금리", "연준", "시장"], category: "시장", sentiment: "positive", sentimentScore: 72, impact: "HIGH"
  },
  {
    id: 3, title: "2차전지 소재 가격 반등, 관련주 투자 심리 개선", 
    summary: "리튬, 니켈 등 2차전지 주요 소재 가격이 반등하면서 관련 기업들의 실적 개선 기대감이 높아지고 있습니다.",
    source: "이데일리", time: "1시간 전", thumbnail: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500",
    tags: ["2차전지", "소재"], category: "산업", sentiment: "positive", sentimentScore: 68, impact: "MEDIUM"
  },
  {
    id: 4, title: "원/달러 환율 1,360원대 하락… 외국인 순매수 전환", 
    summary: "원/달러 환율이 하락세를 보이며 외국인 투자자들의 국내 증시 순매수가 확대되고 있습니다.",
    source: "매일경제", time: "2시간 전", thumbnail: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500",
    tags: ["환율", "외국인"], category: "시장", sentiment: "positive", sentimentScore: 60, impact: "MEDIUM"
  },
  {
    id: 5, title: "삼성전자, 3나노 파운드리 수주 확대 가시화", 
    summary: "삼성전자가 차세대 공정인 3나노 파운드리의 수주를 확대하며 TSMC와의 격차를 좁히고 있습니다.",
    source: "디지털데일리", time: "3시간 전", thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500",
    tags: ["삼성전자", "반도체"], category: "기업", sentiment: "positive", sentimentScore: 77, impact: "HIGH"
  },
  {
    id: 6, title: "K-푸드 수출액 역대 최고치 경신 중", 
    summary: "김, 라면 등 K-푸드의 인기가 전 세계적으로 확산되면서 관련 수출액이 연일 최고치를 기록하고 있습니다.",
    source: "농수산신문", time: "4시간 전", thumbnail: "https://images.unsplash.com/photo-1534422298391-e4f8c170dbbd?w=500",
    tags: ["식품", "수출"], category: "산업", sentiment: "positive", sentimentScore: 82, impact: "MEDIUM"
  },
  {
    id: 7, title: "바이오시밀러 시장 점유율 확대로 셀트리온 실적 기대", 
    summary: "셀트리온의 주요 바이오시밀러 제품들이 유럽과 미국 시장에서 점유율을 안정적으로 확보하고 있습니다.",
    source: "약사신문", time: "5시간 전", thumbnail: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=500",
    tags: ["바이오", "셀트리온"], category: "기업", sentiment: "positive", sentimentScore: 65, impact: "MEDIUM"
  },
  {
    id: 8, title: "부동산 PF 리스크 재부각, 건설주 약세", 
    summary: "부동산 PF 부실 가능성이 다시 대두되면서 건설사들의 주가가 하방 압력을 받고 있습니다.",
    source: "건설경제", time: "6시간 전", thumbnail: "https://images.unsplash.com/photo-1503387762-592dea58ea2e?w=500",
    tags: ["부동산", "건설"], category: "시장", sentiment: "negative", sentimentScore: 32, impact: "HIGH"
  },
  {
    id: 9, title: "자율주행 레벨 4 기술 실증 본격화", 
    summary: "정부와 지자체가 주도하는 자율주행 레벨 4 실증 사업이 도심지에서 본격적으로 시작되었습니다.",
    source: "모빌리티뉴스", time: "7시간 전", thumbnail: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500",
    tags: ["자율주행", "자동차"], category: "산업", sentiment: "positive", sentimentScore: 58, impact: "LOW"
  },
  {
    id: 10, title: "친환경 에너지 투자 세액공제 확대 정책 발표", 
    summary: "정부가 탄소중립 실현을 위해 친환경 에너지 설비 투자에 대한 세액공제 혜택을 대폭 늘리기로 했습니다.",
    source: "정책일보", time: "8시간 전", thumbnail: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500",
    tags: ["신재생에너지", "정책"], category: "정책", sentiment: "positive", sentimentScore: 71, impact: "MEDIUM"
  },
  {
    id: 11, title: "가계대출 금리 상승에 소비 심리 위축 우려", 
    summary: "시중은행의 대출 금리가 지속적으로 오르면서 가계의 가처분 소득이 줄어 소비가 둔화될 우려가 커지고 있습니다.",
    source: "금융저널", time: "9시간 전", thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500",
    tags: ["가계대출", "금리"], category: "경제지표", sentiment: "negative", sentimentScore: 28, impact: "MEDIUM"
  },
  {
    id: 12, title: "네이버, 생성형 AI 검색 정식 서비스 출시", 
    summary: "네이버가 자체 개발한 하이퍼클로바X 기반의 생성형 AI 검색 서비스를 정식으로 선보였습니다.",
    source: "테크크런치", time: "10시간 전", thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500",
    tags: ["AI", "네이버"], category: "기업", sentiment: "positive", sentimentScore: 74, impact: "MEDIUM"
  }
];

export const sentimentStats = {
  overall: 68,
  labels: { positive: 68, neutral: 22, negative: 10 },
  indices: [
    { name: "전체 시장", score: 68, change: 8 },
    { name: "코스피", score: 72, change: 10 },
    { name: "코스닥", score: 64, change: 6 },
    { name: "대형주", score: 70, change: 9 },
    { name: "중소형주", score: 58, change: -3 }
  ],
  trends: [
    { time: "00시", positive: 60, neutral: 25, negative: 15 },
    { time: "04시", positive: 55, neutral: 30, negative: 15 },
    { time: "08시", positive: 70, neutral: 20, negative: 10 },
    { time: "12시", positive: 75, neutral: 15, negative: 10 },
    { time: "16시", positive: 68, neutral: 22, negative: 10 },
    { time: "20시", positive: 65, neutral: 25, negative: 10 },
    { time: "24시", positive: 72, neutral: 18, negative: 10 }
  ]
};

export const topKeywords = [
  { rank: 1, name: "AI반도체", change: 23 },
  { rank: 2, name: "금리인하", change: 18 },
  { rank: 3, name: "2차전지", change: 15 },
  { rank: 4, name: "엔비디아", change: 12 },
  { rank: 5, name: "환율", change: -5 }
];
