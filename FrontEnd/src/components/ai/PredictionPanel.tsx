import "./PredictionPanel.css";

type PredictionPanelProps = {
  title: string;
  probability: number;
  opinion: string;
  riskLevel: string;
  sentiment?: string; // 추가된 필드
};

function PredictionPanel({
  title,
  probability,
  opinion,
  riskLevel,
  sentiment = "긍정", // 기본값 설정
}: PredictionPanelProps) {
  return (
    <div className="prediction-panel">
      <div className="prediction-badge">🤖 AI CONFIDENCE</div>
      <h3>{title}</h3>

      <div className="prediction-score-wrap">
        <strong>{probability}</strong>
        <span>%</span>
      </div>

      <div className="gauge-wrap">
        <div className="gauge-fill" style={{ width: `${probability}%` }}></div>
      </div>

      <p style={{ color: "#94a3b8", lineHeight: "1.65", margin: 0, fontSize: "14px" }}>
        {opinion}
      </p>

      <div className="risk-grid">
        <div className="risk-box">
          <b>SENTIMENT</b>
          <strong style={{ color: sentiment === "긍정" ? "#10b981" : "#ef4444" }}>
            {sentiment}
          </strong>
        </div>
        <div className="risk-box">
          <b>RISK LEVEL</b>
          <strong style={{ color: riskLevel === "높음" ? "#ef4444" : "#facc15" }}>
            {riskLevel}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default PredictionPanel;