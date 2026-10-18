import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SectionTitle from "../components/common/SectionTitle";
import api from "../api/axios";
import "./HomePage.css";

// --- Types ---
interface SentimentStats {
  pieChart: { positive: number; neutral: number; negative: number };
  trendData: { date: string; averageScore: number }[];
  relatedKeywords: string[];
}

interface Article {
  id: number;
  title: string;
  summary?: string;
  sentimentLabel?: string;
  registrationDate: string;
}

interface TopStock {
  stockId: number;
  stockName: string;
  price: number;
  changeRate: number;
}

interface WatchlistPrediction {
  stockId: number;
  stockName: string;
  stockCode: string;
  predictedDirection: string;
  predictedReturnRate: number;
  targetDate: string;
}

function HomePage() {
  const navigate = useNavigate();

  // States
  const [sentimentStats, setSentimentStats] = useState<SentimentStats | null>(null);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [topSearchedStocks, setTopSearchedStocks] = useState<TopStock[]>([]);
  const [watchlistPredictions, setWatchlistPredictions] = useState<WatchlistPrediction[]>([]);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(true);
  const [isAuthError, setIsAuthError] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars

  useEffect(() => {
    // 1-1. 오늘의 시장 분위기
    api.get('/articles/sentiment/statistics')
      .then(res => {
        if (res.data?.data) {
          setSentimentStats(res.data.data);
        }
      })
      .catch(console.error);

    // 1-2. 최신 기사 5개
    api.get('/articles?size=5&sort=LATEST')
      .then(res => {
        if (res.data?.data?.content) {
          setLatestArticles(res.data.data.content.map((a: any) => ({
            id: a.articleId,
            title: a.title,
            summary: a.summary,
            sentimentLabel: a.sentimentLabel,
            registrationDate: a.registrationDate
          })));
        }
      })
      .catch(console.error);

    // 2. 실시간 인기 검색 종목 (검색 로그 통계 조회 -> 없으면 상위 종목 목록 대체)
    const fetchTopStocks = async () => {
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      try {
        const topRes = await api.get(`/statistics/search-logs/top?startTime=${startTime}&endTime=${endTime}&limit=5`).catch(() => null);
        const topList = topRes?.data?.data || [];
        const mergedList: TopStock[] = [];

        for (const item of topList) {
          try {
            const detailRes = await api.get(`/stocks/${item.stockId}`);
            if (detailRes.data?.data) {
              mergedList.push({
                stockId: item.stockId,
                stockName: item.stockName || detailRes.data.data.name,
                price: detailRes.data.data.closingPrice,
                changeRate: detailRes.data.data.performance
              });
            }
          } catch (err) {
            // Ignore individual failure
          }
        }

        // 검색 기록이 부족할 경우 활성 종목 상위 5건으로 채움
        if (mergedList.length === 0) {
          const fallbackRes = await api.get('/stocks?page=0&size=5').catch(() => null);
          const fallbackList = fallbackRes?.data?.data?.content || [];
          for (const s of fallbackList) {
            mergedList.push({
              stockId: s.stockId,
              stockName: s.name,
              price: s.closingPrice,
              changeRate: s.performance
            });
          }
        }

        setTopSearchedStocks(mergedList);
      } catch (err) {
        console.error("Failed to fetch top stocks:", err);
      }
    };
    fetchTopStocks();

    // 3. 나의 관심 종목
    const fetchWatchlistPredictions = async () => {
      try {
        const watchRes = await api.get('/watchlists').catch(() => null);
        if (watchRes?.data?.data) {
          const watchlists = watchRes.data.data;
          if (watchlists.length === 0) {
            setWatchlistPredictions([]);
            setIsWatchlistLoading(false);
            return;
          }

          const predictions: WatchlistPrediction[] = [];
          for (const item of watchlists) {
            try {
              const predRes = await api.get(`/predictions/stocks/${item.stockId}/latest`).catch(() => null);
              if (predRes?.data?.data) {
                predictions.push({
                  stockId: item.stockId,
                  stockName: item.stockName,
                  stockCode: item.stockCode,
                  predictedDirection: predRes.data.data.predictedDirection,
                  predictedReturnRate: predRes.data.data.predictedReturnRate,
                  targetDate: predRes.data.data.targetDate
                });
              }
            } catch (err) { }
          }
          setWatchlistPredictions(predictions);
        }
      } catch (err: any) {
        if (err.response?.status === 401) setIsAuthError(true);
      } finally {
        setIsWatchlistLoading(false);
      }
    };
    fetchWatchlistPredictions();
  }, []);

  // Helpers
  const getDirectionText = (direction: string) => {
    if (direction === "UP") return "상승";
    if (direction === "DOWN") return "하락";
    return "보합";
  };

  const getDirectionColor = (direction: string) => {
    if (direction === "UP") return "#22c55e"; // Green
    if (direction === "DOWN") return "#ef4444"; // Red
    return "var(--text-soft)";
  };

  const getSentimentBadge = (label: string) => {
    if (label === "POSITIVE") return { color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)", text: "긍정" };
    if (label === "NEGATIVE") return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", text: "부정" };
    return { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)", text: "중립" };
  };

  const getSentimentText = (stats: SentimentStats) => {
    const total = stats.pieChart.positive + stats.pieChart.neutral + stats.pieChart.negative;
    if (total === 0) return "데이터 수집 중";
    const posPercent = (stats.pieChart.positive / total) * 100;
    if (posPercent >= 60) return "매우 긍정적";
    if (posPercent >= 40) return "긍정적";
    if (posPercent <= 20) return "부정적";
    return "중립적";
  };

  const formatArticleTime = (dateStr?: string) => {
    if (!dateStr) return "";
    if (dateStr.includes(" ")) {
      return dateStr.split(" ")[1] || dateStr;
    }
    if (dateStr.includes("T")) {
      const parts = dateStr.split("T")[1];
      return parts ? parts.substring(0, 5) : dateStr;
    }
    return dateStr;
  };

  return (
    <div className="home-page">
      <div style={{ paddingBottom: "24px", marginBottom: "40px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <SectionTitle
          title="오늘의 증시 (시장 동향)"
          description="전체 시장의 분위기와 대중의 관심이 집중된 종목을 한눈에 파악하세요."
        />
      </div>

      {/* 1. 주요 뉴스 및 키워드 */}
      <section>
        <div className="section-header">
          <h2 style={{ fontSize: "22px", fontWeight: "950", color: "#fff", margin: 0 }}>주요 뉴스 및 키워드</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "16px" }}>
          <div style={{
            background: "var(--bg-card)",
            padding: "24px 32px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            gap: "32px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}>
            {sentimentStats ? (
              <>
                <div style={{ fontSize: "64px" }}>
                  {(sentimentStats.pieChart.positive >= sentimentStats.pieChart.negative) ? "☀️" : "🌧️"}
                </div>
                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#fff", fontSize: "24px", display: "flex", gap: "12px", alignItems: "center" }}>
                      {getSentimentText(sentimentStats)}
                      <span style={{ fontSize: "13px", color: "var(--text-soft)", fontWeight: "500", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "20px" }}>
                        최근 30일
                      </span>
                    </h3>
                    <p style={{ margin: "8px 0 0", color: "var(--text-soft)", fontSize: "15px" }}>
                      긍정 기사 {sentimentStats.pieChart.positive}건 / 부정 기사 {sentimentStats.pieChart.negative}건
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", background: "rgba(0,0,0,0.15)", padding: "16px", borderRadius: "12px" }}>
                    <span style={{ color: "#fff", fontSize: "14px", fontWeight: "bold", marginRight: "4px" }}>주요 키워드 :</span>
                    {sentimentStats.relatedKeywords.map((kw, idx) => (
                      <span key={idx} style={{ color: "var(--cyan)", background: "rgba(34, 211, 238, 0.1)", padding: "6px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: "bold" }}>
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: "var(--text-soft)" }}>데이터를 불러오는 중입니다...</div>
            )}
          </div>

          <div style={{
            background: "var(--bg-card)",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#fff", fontSize: "18px" }}>🔥 최신 시장 뉴스</h3>
            {latestArticles.length > 0 ? (
              latestArticles.map((article, index) => (
                <div key={article.id} style={{ 
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingBottom: index === latestArticles.length - 1 ? 0 : "16px",
                  borderBottom: index === latestArticles.length - 1 ? "none" : "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: 0, marginRight: "16px" }}>
                    <span
                      onClick={() => navigate(`/news/${article.id}`)}
                      style={{ color: "#fff", fontSize: "17px", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      onMouseOver={(e) => (e.currentTarget.style.color = "var(--cyan)")}
                      onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
                    >
                      {article.title}
                    </span>
                    {article.summary && (
                      <span style={{ color: "#64748b", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                        {article.summary}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {article.sentimentLabel && (
                      <span style={{ 
                        color: getSentimentBadge(article.sentimentLabel).color, 
                        background: getSentimentBadge(article.sentimentLabel).bg, 
                        padding: "10px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "900", whiteSpace: "nowrap"
                      }}>
                        {getSentimentBadge(article.sentimentLabel).text}
                      </span>
                    )}
                    <span style={{ color: "#64748b", fontSize: "13px", minWidth: "40px", textAlign: "right", fontWeight: "500" }}>
                      {formatArticleTime(article.registrationDate)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--text-soft)", fontSize: "14px" }}>뉴스가 없습니다.</div>
            )}
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginTop: "46px" }}>
        {/* 2. 실시간 인기 검색 종목 */}
        <section>
          <div className="section-header" style={{ marginTop: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "950", color: "#fff", margin: 0 }}>실시간 인기 검색 TOP 5</h2>
            <span style={{ color: "#fff", fontSize: "13px", fontWeight: "bold" }}>*(전일 종가 대비)</span>
          </div>
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {topSearchedStocks.length > 0 ? (
              topSearchedStocks.map((stock, index) => (
                <div
                  key={stock.stockId}
                  onClick={() => navigate(`/stocks/${stock.stockId}`)}
                  style={{
                    display: "flex", alignItems: "center", padding: "16px", background: "var(--bg-card)",
                    borderRadius: "12px", cursor: "pointer", transition: "0.2s",
                    border: "1px solid rgba(255, 255, 255, 0.08)"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <span style={{ fontSize: "20px", fontWeight: "950", color: index < 3 ? "var(--cyan)" : "#64748b", width: "40px" }}>
                    {index + 1}
                  </span>
                  <span style={{ fontSize: "18px", color: "#fff", fontWeight: "bold", flex: 1 }}>{stock.stockName}</span>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ color: "#fff", fontSize: "16px", fontWeight: "bold" }}>
                      {stock.price ? stock.price.toLocaleString() + "원" : "-"}
                    </span>
                    <span style={{ color: stock.changeRate > 0 ? "#22c55e" : stock.changeRate < 0 ? "#ef4444" : "var(--text-soft)", fontSize: "13px", fontWeight: "950" }}>
                      {stock.changeRate > 0 ? "+" : ""}{stock.changeRate}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-soft)", background: "var(--bg-card)", borderRadius: "12px" }}>
                검색 데이터가 없습니다.
              </div>
            )}
          </div>
        </section>

        {/* 3. 나의 관심 종목 */}
        <section>
          <div className="section-header" style={{ marginTop: 0 }}>
            <h2 style={{ fontSize: "22px", fontWeight: "950", color: "#fff", margin: 0 }}>나의 관심 종목</h2>
            <span className="section-action" onClick={() => navigate("/mypage")} style={{ cursor: "pointer" }}>마이페이지로 이동 →</span>
          </div>
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {isWatchlistLoading ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-soft)", background: "var(--bg-card)", borderRadius: "12px" }}>
                불러오는 중...
              </div>
            ) : isAuthError ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-soft)", background: "var(--bg-card)", borderRadius: "12px" }}>
                로그인이 필요한 서비스입니다.<br />
                <button onClick={() => navigate("/login")} style={{ marginTop: "12px", padding: "8px 16px", borderRadius: "8px", border: "none", background: "var(--cyan)", color: "#000", fontWeight: "bold", cursor: "pointer" }}>로그인하기</button>
              </div>
            ) : watchlistPredictions.length > 0 ? (
              watchlistPredictions.map(pred => (
                <div
                  key={pred.stockId}
                  onClick={() => navigate(`/stocks/${pred.stockId}`)}
                  style={{
                    display: "flex", alignItems: "center", padding: "16px", background: "var(--bg-card)",
                    borderRadius: "12px", cursor: "pointer", transition: "0.2s",
                    border: "1px solid rgba(255, 255, 255, 0.08)"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "18px", color: "#fff", fontWeight: "bold" }}>{pred.stockName}</div>
                    <div style={{ color: "var(--text-soft)", fontSize: "13px", marginTop: "4px" }}>AI의 예측날짜: {pred.targetDate}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{
                      color: getDirectionColor(pred.predictedDirection),
                      background: `rgba(${pred.predictedDirection === 'UP' ? '34, 197, 94' : pred.predictedDirection === 'DOWN' ? '239, 68, 68' : '148, 163, 184'}, 0.15)`,
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "bold"
                    }}>
                      {getDirectionText(pred.predictedDirection)} 예측
                    </span>
                    <span style={{
                      color: pred.predictedReturnRate > 0 ? "#22c55e" : pred.predictedReturnRate < 0 ? "#ef4444" : "var(--text-soft)",
                      fontWeight: "950", fontSize: "16px", width: "70px", textAlign: "right"
                    }}>
                      {pred.predictedReturnRate > 0 ? "+" : ""}{pred.predictedReturnRate}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--text-soft)", background: "var(--bg-card)", borderRadius: "12px" }}>
                관심 종목을 등록하고 AI 예측을 확인해보세요!
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;


