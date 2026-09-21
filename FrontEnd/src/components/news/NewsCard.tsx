import "./NewsCard.css";

type NewsCardProps = {
  title: string;
  source: string;
  sentiment: string; // "긍정" | "부정" | "중립"
  sentimentScore: number;
  relatedStock: string;
  summary: string;
  onClick?: () => void;
};

function NewsCard({
  title,
  source,
  sentiment,
  sentimentScore,
  relatedStock,
  summary,
  onClick
}: NewsCardProps) {
  const isPositive = sentiment === "긍정";
  const isNegative = sentiment === "부정";
  const badgeColor = isPositive ? "positive" : isNegative ? "negative" : "neutral";
  const badgeLabel = isPositive ? "📈 긍정" : isNegative ? "📉 부정" : "➖ 중립";
  const scoreColor = isPositive ? "var(--cyan)" : isNegative ? "#ef4444" : "#f59e0b";
  
  // Format score to 0-100 scale (Assuming backend sends 0-100 or 0-1. Let's assume 0-100 scale for percentage)
  const scorePercent = typeof sentimentScore === 'number' ? Math.round(sentimentScore) : 0;

  return (
    <div className={`news-card news-card--${badgeColor}`} onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      {/* 상단 배지 영역 */}
      <div className="news-card__header">
        <span className="news-card__source">{source}</span>
        <span className={`news-card__badge ${badgeColor}`}>
          {badgeLabel}
        </span>
      </div>

      {/* 제목 */}
      <h3 className="news-card__title">{title}</h3>

      {/* 요약 */}
      <p className="news-card__summary">{summary}</p>

      {/* 하단 메타 정보 */}
      <div className="news-card__footer">
        <div className="news-card__stock">
          <span className="news-card__stock-label">관련 종목</span>
          <span className="news-card__stock-name">{relatedStock}</span>
        </div>
        <div style={{ flex: 1, marginLeft: "20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-soft)" }}>AI 감성 스코어</span>
            <span style={{ fontSize: "12px", fontWeight: "bold", color: scoreColor }}>
              {scorePercent}%
            </span>
          </div>
          <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ 
              width: `${scorePercent}%`, 
              height: "100%", 
              background: scoreColor, 
              transition: "width 1s ease-in-out" 
            }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;