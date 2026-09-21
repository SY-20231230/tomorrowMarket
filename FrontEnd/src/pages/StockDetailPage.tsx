import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import SectionTitle from "../components/common/SectionTitle";
import NewsCard from "../components/news/NewsCard";
import PredictionPanel from "../components/ai/PredictionPanel";
import api from "../api/axios";
import "../styles/StockDetailPage.css";

interface StockDetail {
  stockId: number;
  name: string;
  stockCode: string;
  marketType: string;
  sectorName: string;
  closingPrice: number;
  performance: number;
}

interface StockHistory {
  date: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closingPrice: number;
  volume: number;
  performance: number;
}

function StockDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [pastRange, setPastRange] = useState("1개월");
  
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      try {
        const [detailRes, historyRes, predictionRes, articleRes, watchlistRes] = await Promise.all([
          api.get(`/stocks/${id}`),
          api.get(`/stocks/${id}/history`).catch(() => ({ data: { data: [] } })),
          api.get(`/predictions/stocks/${id}/latest`).catch(() => null),
          api.get(`/articles/stocks/${id}?size=3`).catch(() => null),
          api.get(`/watchlists`).catch(() => ({ data: { data: [] } }))
        ]);

        if (watchlistRes.data?.data) {
          const watchlists = watchlistRes.data.data;
          setIsFavorite(watchlists.some((w: any) => w.stockId === Number(id)));
        }
        
        if (detailRes.data?.data) {
          const fetchedStock = detailRes.data.data;
          setStock(fetchedStock);
          
          try {
            const stored = localStorage.getItem("recentViews");
            let views = stored ? JSON.parse(stored) : [];
            views = views.filter((v: any) => v.stockId !== fetchedStock.stockId);
            views.unshift({
              stockId: fetchedStock.stockId,
              name: fetchedStock.name,
              stockCode: fetchedStock.stockCode,
              timestamp: new Date().getTime()
            });
            if (views.length > 10) views = views.slice(0, 10);
            localStorage.setItem("recentViews", JSON.stringify(views));
          } catch(e) {
            console.error("Failed to save recent view", e);
          }
        }
        if (historyRes.data?.data) {
          // Format date for chart (e.g. "MM/DD")
          const formattedHistory = historyRes.data.data.map((h: any) => {
            const d = new Date(h.date);
            return {
              ...h,
              dateLabel: `${d.getMonth() + 1}/${d.getDate()}`
            };
          });
          setHistory(formattedHistory);
        }
        if (predictionRes?.data?.data) {
          const pd = predictionRes.data.data;
          setPredictions([{
            horizon: `단기 (${pd.predictionPeriod}일)`,
            predictedReturnRate: pd.predictedReturnRate,
            predictedDirection: pd.predictedDirection,
            opinion: `AI가 분석한 단기 방향성은 ${pd.predictedDirection === 'UP' ? '상승' : '하락'}입니다.`
          }]);
        }
        if (articleRes?.data?.data?.content) {
          setArticles(articleRes.data.data.content);
        }
      } catch (error: any) {
        console.error("Failed to fetch stock detail:", error);
        setErrorMsg(error.response?.data?.message || "종목 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchStockData();
    }
  }, [id]);

  const handleReanalyze = () => {
    setIsReanalyzing(true);
    // Simulate API call for re-analysis
    setTimeout(() => {
      setIsReanalyzing(false);
      alert("최신 데이터를 반영하여 AI 재분석이 완료되었습니다.");
    }, 2000);
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/watchlists/${id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/watchlists/${id}`);
        setIsFavorite(true);
      }
    } catch (e) {
      alert("관심 종목 처리에 실패했습니다.");
    }
  };

  // Filter chart data based on pastRange
  const filteredHistory = React.useMemo(() => {
    if (!history || history.length === 0) return [];
    
    const now = new Date();
    let daysToSubtract = 30;
    if (pastRange === "1주일") daysToSubtract = 7;
    else if (pastRange === "1개월") daysToSubtract = 30;
    else if (pastRange === "3개월") daysToSubtract = 90;
    else if (pastRange === "6개월") daysToSubtract = 180;

    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysToSubtract);
    
    return history.filter(h => new Date(h.date) >= cutoffDate);
  }, [history, pastRange]);


  if (errorMsg) {
    return (
      <div style={{ padding: "100px", textAlign: "center", color: "#ef4444" }}>
        <h2>오류 발생</h2>
        <p>{errorMsg}</p>
        <button 
          onClick={() => navigate("/stocks")}
          style={{ marginTop: "20px", padding: "10px 20px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "8px", cursor: "pointer" }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (isLoading || !stock) {
    return (
      <div style={{ padding: "100px", textAlign: "center", color: "var(--text-soft)" }}>
        <h2>종목 상세 정보를 불러오는 중입니다...</h2>
      </div>
    );
  }

  const isUp = stock.performance > 0;
  const color = isUp ? "#22c55e" : "#ef4444"; // Green/Red standard
  const priceStr = stock.closingPrice ? stock.closingPrice.toLocaleString() : "-";
  const perfStr = stock.performance ? stock.performance.toFixed(2) : "0.00";

  return (
    <div className="stock-detail-page" style={{ paddingBottom: "100px" }}>
      <button 
        onClick={() => navigate("/stocks")} 
        style={{ background: "transparent", border: "none", color: "var(--text-soft)", fontSize: "16px", cursor: "pointer", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}
      >
        ← 목록으로 돌아가기
      </button>

      {/* Header / Overview Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(15, 23, 42, 0.6)", padding: "30px 40px", borderRadius: "24px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <div>
          <h1 style={{ fontSize: "36px", fontWeight: "950", margin: "0 0 8px 0" }}>
            {stock.name} <span style={{ fontSize: "20px", color: "var(--text-soft)", fontWeight: "normal" }}>{stock.stockCode}</span>
            <button onClick={toggleFavorite} style={{ marginLeft: "12px", background: "none", border: "none", fontSize: "28px", cursor: "pointer", color: isFavorite ? "#eab308" : "#475569" }}>
              {isFavorite ? "★" : "☆"}
            </button>
          </h1>
          <span style={{ background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: "20px", fontSize: "14px", color: "#fff", marginRight: "8px" }}>
            {stock.marketType || "KOSPI"}
          </span>
          <span style={{ background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: "20px", fontSize: "14px", color: "var(--cyan)" }}>
            {stock.sectorName || "섹터미상"}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <h2 style={{ fontSize: "40px", fontWeight: "950", margin: "0", color: "#fff" }}>
            {priceStr}원
          </h2>
          <p style={{ fontSize: "20px", fontWeight: "900", margin: "8px 0 0 0", color }}>
            {isUp ? "▲" : "▼"} {Math.abs(Number(perfStr))}%
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px", marginTop: "30px" }}>
        
        {/* Section 1: Chart */}
        <div className="result-display-area" style={{ margin: 0 }}>
          <div className="chart-header">
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: 950, margin: 0 }}>과거 주가 흐름 및 거래량</h3>
            </div>
            <div className="time-range-tabs">
              {["1주일", "1개월", "3개월", "6개월"].map(range => (
                <button 
                  key={range}
                  className={`range-tab ${pastRange === range ? "active" : ""}`}
                  onClick={() => setPastRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div style={{ width: "100%", height: "350px", marginTop: "20px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredHistory}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="dateLabel" stroke="var(--text-soft)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="price" orientation="left" hide={false} domain={[(dataMin: number) => Math.floor(dataMin * 0.95), (dataMax: number) => Math.ceil(dataMax * 1.05)]} tickFormatter={(v) => v.toLocaleString()} stroke="var(--text-soft)" fontSize={11} width={80} />
                <YAxis yAxisId="volume" orientation="right" hide={false} domain={[0, 'auto']} tickFormatter={(v) => v.toLocaleString()} stroke="rgba(255,255,255,0.2)" fontSize={11} width={80} />
                <Legend verticalAlign="top" height={36} formatter={(value) => <span style={{ color: "var(--text-soft)" }}>{value === "closingPrice" ? "종가 (Price)" : "거래량 (Volume)"}</span>} />
                
                <Tooltip 
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "#fff" }}
                  itemStyle={{ color: color, fontWeight: 900 }}
                  labelStyle={{ color: "var(--text-soft)" }}
                  formatter={(value: number, name: string) => [
                    name === "volume" ? value.toLocaleString() : value.toLocaleString() + "원",
                    name === "volume" ? "거래량" : "종가"
                  ]}
                />
                
                {/* 거래량 Bar */}
                <Bar yAxisId="volume" dataKey="volume" fill="rgba(255, 255, 255, 0.1)" barSize={20} />
                
                {/* 종가 Area */}
                <Area 
                  yAxisId="price"
                  type="monotone" 
                  dataKey="closingPrice" 
                  stroke={color} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  dot={{ r: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 2: AI Dashboard */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <PredictionPanel 
            predictions={predictions.length > 0 ? predictions : undefined}
            onReanalyze={handleReanalyze} 
            isReanalyzing={isReanalyzing} 
          />
        </div>

      </div>

      {/* Section 3: News Area */}
      <section style={{ marginTop: "40px" }}>
        <SectionTitle title="종목 관련 뉴스" />
        <div style={{ display: "grid", gap: "20px" }}>
          {articles.length > 0 ? articles.map((news) => (
            <NewsCard
              key={news.articleId}
              title={news.title}
              source={news.press}
              sentiment={news.sentimentScore > 60 ? "긍정" : news.sentimentScore < 40 ? "부정" : "중립"}
              sentimentScore={news.sentimentScore}
              relatedStock={stock.name}
              summary={news.summary}
              onClick={() => navigate(`/news/${news.articleId}`)}
            />
          )) : (
            <div style={{ color: "var(--text-soft)" }}>최신 뉴스가 없습니다.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default StockDetailPage;