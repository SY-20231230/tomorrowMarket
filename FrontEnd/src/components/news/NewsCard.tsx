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
    <div className="news-card">
      <div className="news-card-top">
        <div className="news-label">{source}</div>
        <span className={`news-badge ${isPositive ? "positive" : ""}`}>
          {isPositive ? "긍정" : "부정"}
        </span>
      </div>

      <h3>{title}</h3>
      <p>{summary}</p>

      <div className="news-impact">
        <span>영향 종목: {relatedStock}</span>
        <span>Impact {isPositive ? 82 : 74}</span>
      </div>
    </div>
  );
}

export default NewsCard;