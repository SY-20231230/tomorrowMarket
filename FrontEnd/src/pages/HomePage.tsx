import { useNavigate } from "react-router-dom"; // 추가
import SectionTitle from "../components/common/SectionTitle";
import StockCard from "../components/stock/StockCard";
import StockTable from "../components/stock/StockTable";
import MarketSummary from "../components/market/MarketSummary";
import NewsCard from "../components/news/NewsCard";

import { mockStocks } from "../data/mockStocks";
import { mockNews } from "../data/mockNews";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate(); // 추가
  const favoriteStocks = mockStocks.slice(0, 2);

  // 핸들러 추가
  const handleMarketAction = (marketName: string, mode: "past" | "ai") => {
    navigate("/market", { state: { marketName, mode } });
  };

  return (
    <div className="home-page">
      <SectionTitle
        title="홈 대시보드"
        description="관심 종목과 시장 주요 지표를 실시간으로 모니터링하세요."
      />

      <section style={{ marginTop: "24px" }}>
        <div className="section-header">
          <h2 style={{ fontSize: "22px", fontWeight: "950", color: "#fff", margin: 0 }}>실시간 지표</h2>
          <span className="section-action" onClick={() => navigate("/market")} style={{ cursor: "pointer" }}>더보기 →</span>
        </div>
        <MarketSummary onAction={handleMarketAction} />
      </section>

      <section style={{ marginTop: "46px" }}>
        <SectionTitle title="인기 종목" />
        <div className="stock-grid">
          {mockStocks
            .filter(stock => ["삼성전자", "SK하이닉스", "카카오", "NAVER"].includes(stock.name))
            .map((stock) => (
              <StockCard
                key={stock.code}
                name={stock.name}
                price={stock.price}
                changeRate={stock.changeRate}
                prediction={stock.prediction}
              />
            ))}
        </div>
      </section>

      <section style={{ marginTop: "46px" }}>
        <SectionTitle title="관심 종목" />
        <StockTable stocks={favoriteStocks} />
      </section>

      <section style={{ marginTop: "46px" }}>
        <SectionTitle title="주요 뉴스" />
        <div className="news-grid">
          {mockNews.map((news) => (
            <NewsCard
              key={news.id}
              title={news.title}
              source={news.source}
              sentiment={news.sentiment}
              relatedStock={news.relatedStock}
              summary={news.summary}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
