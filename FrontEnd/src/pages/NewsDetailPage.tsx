import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import api from "../api/axios";
import "./NewsDetailPage.css";

const NewsDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await api.get(`/articles/${id}`);
        if (res.data && res.data.data) {
          setArticle(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch article:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchArticle();
  }, [id]);

  if (isLoading) {
    return <div style={{ color: "white", padding: "100px", textAlign: "center" }}>로딩 중...</div>;
  }

  if (!article) {
    return <div style={{ color: "white", padding: "100px", textAlign: "center" }}>기사를 찾을 수 없습니다.</div>;
  }

  const isHot = article.sentimentScore >= 80 || article.sentimentScore <= 20;
  const sentimentStr = article.sentimentLabel === "POSITIVE" ? "긍정" : article.sentimentLabel === "NEGATIVE" ? "부정" : "중립";
  const sentimentColor = article.sentimentLabel === "POSITIVE" ? "#22c55e" : article.sentimentLabel === "NEGATIVE" ? "#ef4444" : "#64748b";
  
  // Single gauge for the article's own score
  const gaugeData = [
    { name: "Score", value: Math.abs(article.sentimentScore), color: sentimentColor },
    { name: "Rem", value: 100 - Math.abs(article.sentimentScore), color: "rgba(255,255,255,0.1)" }
  ];

  return (
    <div className="news-detail-page">
      <div className="detail-navigation">
        <button className="back-btn" onClick={() => navigate("/news")}>
          <span className="back-icon">←</span> 뉴스 모음으로 돌아가기
        </button>
      </div>

      <div className="detail-container" style={{ gridTemplateColumns: "1fr", maxWidth: "900px", margin: "0 auto" }}>
        {/* Full Width Content */}
        <main className="detail-main-content">
          <div className="detail-header">
            <div className="detail-category-tags">
              <span className="detail-tag">{article.industry || "기타 산업"}</span>
              {article.tags && article.tags.map((tag: string) => (
                <span key={tag} className="detail-tag">#{tag}</span>
              ))}
            </div>
            <div className="detail-actions">
              <button className="action-btn">북마크</button>
              <button className="action-btn">공유</button>
            </div>
          </div>

          <h1 className="detail-title">
            {isHot && <span style={{ background: "#ef4444", color: "#fff", fontSize: "14px", padding: "4px 8px", borderRadius: "4px", marginRight: "12px", verticalAlign: "middle" }}>HOT</span>}
            {article.title}
          </h1>
          
          <div className="detail-meta">
            <span className="detail-source">{article.source || "내일장 뉴스"}</span>
            <span className="detail-time-group">
              <span className="detail-date">{new Date(article.registrationDate).toLocaleString()}</span>
            </span>
          </div>

          {/* AI Sentiment Gauge Moved to Header Area */}
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "16px", marginBottom: "30px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 10px 0", color: sentimentColor, display: "flex", alignItems: "center", gap: "8px" }}>
                ✨ AI 기사 감성 분석 
                <span style={{ fontSize: "12px", color: "white", background: sentimentColor, padding: "2px 8px", borderRadius: "12px" }}>{sentimentStr}</span>
              </h3>
              <p style={{ margin: 0, color: "var(--text-soft)", fontSize: "14px", lineHeight: "1.6" }}>
                AI가 분석한 이 기사의 감성 점수는 <strong style={{ color: "white" }}>{article.sentimentScore}점</strong>입니다. 
                {article.sentimentLabel === "POSITIVE" && " 시장에 긍정적인 영향을 미칠 가능성이 높은 뉴스입니다."}
                {article.sentimentLabel === "NEGATIVE" && " 시장에 부정적인 영향을 미칠 수 있으니 주의가 필요한 뉴스입니다."}
                {article.sentimentLabel === "NEUTRAL" && " 시장에 미치는 영향이 중립적인 뉴스입니다."}
              </p>
            </div>
            <div style={{ width: "120px", height: "120px", position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gaugeData} cx="50%" cy="50%" innerRadius={40} outerRadius={55} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                    {gaugeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "white" }}>{article.sentimentScore}</div>
              </div>
            </div>
          </div>

          <div className="detail-hero-image">
            {/* Default Placeholder */}
            <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1000" alt="News Cover" />
            <div className="image-overlay"></div>
          </div>

          <section className="detail-section detail-summary">
            <div className="section-title-group">
              <span className="ai-badge">📝 기사 본문</span>
            </div>
            <p className="ai-summary-text" style={{ fontSize: "16px", lineHeight: "1.8", color: "#e2e8f0", whiteSpace: "pre-wrap" }}>
              {article.content || article.summary || "제공된 내용이 없습니다."}
            </p>
            {article.url && (
              <div style={{ marginTop: "20px" }}>
                <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--cyan)", textDecoration: "underline" }}>기사 원문 보러가기</a>
              </div>
            )}
          </section>

          {/* Related Stock - Real Data (Single Stock) */}
          {article.symbol && article.stockName && (
            <section className="detail-section detail-related-stocks">
              <h3 className="sub-section-title">이 기사의 핵심 연관 종목</h3>
              <div className="related-stocks-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div 
                  className="related-stock-item" 
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)" }}
                  onClick={async () => {
                    try {
                      const res = await api.get(`/stocks?keyword=${article.symbol}`);
                      const stock = res.data?.data?.content?.[0];
                      if (stock) {
                        navigate(`/stocks/${stock.stockId}`);
                      } else {
                        alert("해당 종목을 찾을 수 없습니다.");
                      }
                    } catch (e) {
                      console.error(e);
                      alert("종목 정보를 불러오는데 실패했습니다.");
                    }
                  }} 
                >
                  <div>
                    <div style={{ color: "var(--text-soft)", fontSize: "12px", marginBottom: "4px" }}>{article.symbol}</div>
                    <div className="stock-name" style={{ fontSize: "18px", color: "var(--cyan)" }}>{article.stockName}</div>
                  </div>
                  <div style={{ color: "var(--cyan)", fontWeight: "bold" }}>
                    상세 분석 보러가기 →
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default NewsDetailPage;
