import "./NewsCard.css";

type NewsCardProps = {
  title: string;
  source: string;
  sentiment: string;
  relatedStock: string;
  summary: string;
};

function NewsCard({
  title,
  source,
  sentiment,
  relatedStock,
  summary,
}: NewsCardProps) {
  const isPositive = sentiment === "positive";

  return (
    <div className={`news-card ${isPositive ? "news-card--positive" : "news-card--negative"}`}>
      {/* 상단 배지 영역 */}
      <div className="news-card__header">
        <span className="news-card__source">{source}</span>
        <span className={`news-card__badge ${isPositive ? "positive" : "negative"}`}>
          {isPositive ? "📈 긍정" : "📉 부정"}
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
        <div className="news-card__impact">
          <span className="news-card__impact-label">Impact</span>
          <span className={`news-card__impact-score ${isPositive ? "positive" : "negative"}`}>
            {isPositive ? 82 : 74}
          </span>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;