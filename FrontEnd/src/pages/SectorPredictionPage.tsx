import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import SectionTitle from "../components/common/SectionTitle";
import Card from "../components/common/Card";
import { mockSectors } from "../data/mockSectors";
import "./SectorPredictionPage.css"; // 스타일 분리

// 색상 상수 정의
const NEON_GREEN = "#00ff88";

// 날짜 포맷 헬퍼
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

// 영업일(평일) 계산 함수 (오늘 포함)
const getBusinessDaysWithToday = (count: number) => {
  const days = [formatDate(new Date())];
  let current = new Date();
  while (days.length < count + 1) {
    current.setDate(current.getDate() + 1);
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(formatDate(new Date(current)));
    }
  }
  return days;
};

// 모든 날짜 계산 함수 (오늘 포함)
const getAllDaysWithToday = (count: number) => {
  const days = [formatDate(new Date())];
  let current = new Date();
  for (let i = 0; i < count; i++) {
    current.setDate(current.getDate() + 1);
    days.push(formatDate(new Date(current)));
  }
  return days;
};

function SectorPredictionPage() {
  const { sectorId } = useParams();
  const navigate = useNavigate();
  const [modelType, setModelType] = useState<"short" | "long">("short");

  const sector = useMemo(() => mockSectors.find(s => s.id === sectorId), [sectorId]);

  const chartData = useMemo(() => {
    if (!sector) return [];
    const count = modelType === "short" ? 5 : 20;
    const labels = modelType === "short" ? getBusinessDaysWithToday(count) : getAllDaysWithToday(count);
    let basePrice = 100000;
    return labels.map((label, index) => {
      if (index === 0) return { date: label, price: basePrice, isToday: true };
      const trend = sector.changeRate / 10; 
      const randomFactor = (Math.random() - 0.4) * 2;
      basePrice = basePrice * (1 + (trend + randomFactor) / 100);
      return { date: label, price: Math.round(basePrice) };
    });
  }, [sector, modelType]);

  if (!sector) {
    return <div className="error-message">분야 정보를 불러울 수 없습니다.</div>;
  }

  return (
    <div className="prediction-page">
      <div className="navigation-area">
        <button className="back-btn" onClick={() => navigate("/sector")}>
          ← 분야 리스트로 돌아가기
        </button>
      </div>

      <div className="prediction-header">
        <SectionTitle
          title={`${sector.name} AI 주가 예측`}
          description="현재 시점 대비 향후 시장 지수 변동 시나리오입니다."
        />
        
        <div className="model-selector-wrapper">
          <button 
            className={`model-tab ${modelType === "short" ? "active" : ""}`}
            onClick={() => setModelType("short")}
          >
            단기 (오늘 + 5영업일)
          </button>
          <button 
            className={`model-tab ${modelType === "long" ? "active" : ""}`}
            onClick={() => setModelType("long")}
          >
            장기 (오늘 + 20일)
          </button>
        </div>
      </div>

      <Card className="graph-card-content">
        <div className="graph-card-header">
          <div>
            <h3 className="graph-title">
              {modelType === "short" ? "단기 주가 변동 예측" : "20일 장기 추세 분석"}
            </h3>
            <p className="graph-subtitle">● 현재가 기준 시뮬레이션 결과</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="confidence-label">모델 신뢰도</span>
            <div className="confidence-value">{modelType === "short" ? "92.4%" : "78.1%"}</div>
          </div>
        </div>

        <div className="chart-container" style={{ width: "100%", height: "400px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={NEON_GREEN} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={NEON_GREEN} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#fff" 
                fontSize={13} 
                fontWeight={900} 
                tickLine={false} 
                axisLine={false}
                dy={15}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ 
                  background: "#0f172a", 
                  border: `2px solid ${NEON_GREEN}`, 
                  borderRadius: "16px",
                  padding: "12px 20px"
                }}
                labelStyle={{ color: "#94a3b8", marginBottom: "8px", fontWeight: 800 }}
                itemStyle={{ color: NEON_GREEN, fontSize: "18px", fontWeight: 950 }}
                formatter={(value: any) => [value ? `${Number(value).toLocaleString()} PTS` : "0 PTS", "예측 지수"]}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={NEON_GREEN} 
                strokeWidth={5}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                animationDuration={1500}
                dot={{ r: 7, fill: NEON_GREEN, strokeWidth: 3, stroke: "#fff" }}
                activeDot={{ r: 10, fill: "#fff", stroke: NEON_GREEN, strokeWidth: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="analysis-grid">
        <Card>
          <h4 className="analysis-title">AI 시나리오 분석</h4>
          <p className="analysis-text">
            오늘의 시장 데이터를 시작점으로 하여 {modelType === "short" ? "앞으로 5영업일간의" : "앞으로 20일간의"} 흐름을 시뮬레이션했습니다. 
          </p>
        </Card>
        <Card>
          <h4 className="caution-title">투자 유의사항</h4>
          <p className="caution-text">
            본 데이터는 과거의 패턴을 학습한 AI 모델의 추정치이며, 실제 시장 상황에 따라 큰 차이가 발생할 수 있습니다. 
          </p>
        </Card>
      </div>
    </div>
  );
}

export default SectorPredictionPage;
