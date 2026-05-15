import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, Tooltip
} from "recharts";
import { 
  mockNews, 
  sentimentStats, 
  topKeywords 
} from "../data/mockNewsData";
import "./NewsPage.css";

const COLORS = ["#10b981", "#64748b", "#ef4444"]; // 긍정, 중립, 부정
const CATEGORIES = ["전체", "주요이슈", "시장", "산업", "기업", "정책", "경제지표"];
const INDUSTRIES = ["모든 산업군", "반도체", "IT서비스", "2차전지", "바이오", "자동차", "부동산", "금융"];
const SENTIMENTS = ["모든 감성", "긍정", "부정", "중립"];

function NewsPage() {
  const navigate = useNavigate();
  // State Management
  const [activeTab, setActiveTab] = useState("전체");
  const [selectedIndustry, setSelectedIndustry] = useState("모든 산업군");
  const [selectedSentiment, setSelectedSentiment] = useState("모든 감성");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // 필터 초기화 함수
  const resetFilters = () => {
    setActiveTab("전체");
    setSelectedIndustry("모든 산업군");
    setSelectedSentiment("모든 감성");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // 태그 클릭 핸들러
  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setCurrentPage(1);
  };

  // 통합 필터링 로직
  const filteredNews = useMemo(() => {
    return mockNews.filter(news => {
      // 1. 카테고리 필터
      const categoryMatch = activeTab === "전체" || news.category === activeTab || (activeTab === "주요이슈" && news.impact === "HIGH");
      
      // 2. 산업군 필터 (태그에 산업군 키워드가 포함되어 있는지 확인)
      const industryMatch = selectedIndustry === "모든 산업군" || news.tags.includes(selectedIndustry);
      
      // 3. 감성 필터
      const sentimentMap: Record<string, string> = { "긍정": "positive", "부정": "negative", "중립": "neutral" };
      const sentimentMatch = selectedSentiment === "모든 감성" || news.sentiment === sentimentMap[selectedSentiment];
      
      // 4. 검색어 필터 (제목, 요약, 태그에서 검색)
      const query = searchQuery.toLowerCase();
      const searchMatch = !searchQuery || 
        news.title.toLowerCase().includes(query) || 
        news.summary.toLowerCase().includes(query) ||
        news.tags.some(tag => tag.toLowerCase().includes(query));

      return categoryMatch && industryMatch && sentimentMatch && searchMatch;
    });
  }, [activeTab, selectedIndustry, selectedSentiment, searchQuery]);

  // 페이지네이션 로직
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const currentNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedIndustry, selectedSentiment, searchQuery]);

  const pieData = [
    { name: "긍정", value: sentimentStats.labels.positive },
    { name: "중립", value: sentimentStats.labels.neutral },
    { name: "부정", value: sentimentStats.labels.negative },
  ];

  return (
    <div className="news-page">
      {/* 2. Page Header */}
      <header className="news-page-header">
        <div className="news-page-title">
          <h1>뉴스 모음</h1>
          <p>AI가 분석한 실시간 금융·주식 뉴스와 시장 인사이트를 확인하세요.</p>
        </div>
        <div className="news-header-actions">
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="뉴스 검색 (키워드, 종목명)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <select className="filter-select" style={{ minWidth: "120px" }}>
            <option>최신순</option>
            <option>과거순</option>
            <option>감성점수순</option>
          </select>
        </div>
      </header>

      {/* 3. Top Stats Row */}
      <div className="news-stats-row">
        <div className="stats-card">
          <div className="card-title">오늘의 시장 감성 ℹ️</div>
          <div className="sentiment-overview">
            <div style={{ width: "120px", height: "120px", position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={5} dataKey="value">
                    {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 900 }}>68%</div>
                <div style={{ fontSize: "10px", color: "#10b981", fontWeight: 700 }}>긍정적</div>
              </div>
            </div>
            <div className="sentiment-pie-info">
              <div className="pie-label"><span style={{ color: "#10b981" }}>●</span> 긍정 68%</div>
              <div className="pie-label"><span style={{ color: "#64748b" }}>●</span> 중립 22%</div>
              <div className="pie-label"><span style={{ color: "#ef4444" }}>●</span> 부정 10%</div>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="card-title">주요 감성 지수 ℹ️</div>
          <div className="indices-list">
            {sentimentStats.indices.map(idx => (
              <div className="index-row" key={idx.name}>
                <span className="index-name">🌐 {idx.name}</span>
                <span className="index-score">{idx.score}</span>
                <span className={`index-change ${idx.change >= 0 ? "up" : "down"}`}>{idx.change >= 0 ? `▲ ${idx.change}` : `▼ ${Math.abs(idx.change)}`}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-card">
          <div className="card-title">오늘의 주요 이슈</div>
          <div className="issue-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {["AI 반도체 수요 증가 기대감 지속", "미국 금리 인하 기대감 확대", "2차전지 관련주 강세", "원/달러 환율 소폭 하락", "중국 경기 부양책 기대"].map((issue, i) => (
              <div key={i} style={{ fontSize: "13px", display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ color: "#475569", fontWeight: 900, fontSize: "11px" }}>0{i+1}</span>
                <span style={{ fontWeight: 700, color: "#cbd5e1" }}>{issue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Main Content Layout (Filter Bar moved inside) */}
      <div className="news-main-layout">
        <div className="news-left-column">
          <div className="news-filter-bar">
            <div className="filter-tabs">
              {CATEGORIES.map(tab => (
                <div key={tab} className={`filter-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</div>
              ))}
            </div>
            <div className="filter-selects">
              <select className="filter-select" value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)}>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
              <select className="filter-select" value={selectedSentiment} onChange={(e) => setSelectedSentiment(e.target.value)}>
                {SENTIMENTS.map(sent => <option key={sent} value={sent}>{sent}</option>)}
              </select>
              <button className="filter-reset-btn" onClick={resetFilters}>🔄 필터 초기화</button>
            </div>
          </div>

          <section className="news-list">
          {currentNews.length > 0 ? (
            currentNews.map(news => (
              <div className="news-card" key={news.id} onClick={() => navigate(`/news/${news.id}`)}>
                <img src={news.thumbnail} alt={news.title} className="news-thumbnail" />
                <div className="news-content">
                  <div className="news-title">
                    {news.impact === "HIGH" && <span style={{ background: "#ef4444", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", marginRight: "8px" }}>HOT</span>}
                    {news.title}
                  </div>
                  <p className="news-summary">{news.summary}</p>
                  <div className="news-meta">
                    <div className="meta-left">
                      <span>{news.source}</span>
                      <span>|</span>
                      <span>{news.time}</span>
                      <div className="news-tags">
                        {news.tags.map(tag => (
                          <span key={tag} className="news-tag" onClick={(e) => { e.stopPropagation(); handleTagClick(tag); }}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="sentiment-badge">
                      <div className="badge-score" style={{ 
                        background: news.sentiment === "positive" ? "rgba(16, 185, 129, 0.1)" : news.sentiment === "negative" ? "rgba(239, 68, 68, 0.1)" : "rgba(100, 116, 139, 0.1)",
                        color: news.sentiment === "positive" ? "#10b981" : news.sentiment === "negative" ? "#ef4444" : "#94a3b8"
                      }}>
                        {news.sentiment === "positive" ? "긍정" : news.sentiment === "negative" ? "부정" : "중립"} 감성점수 {news.sentimentScore}
                      </div>
                      <div className="badge-impact">영향도 {news.impact}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "80px", color: "#64748b" }}>검색 결과가 없습니다.</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>{"<"}</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button 
                  key={i + 1} 
                  className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>{">"}</button>
            </div>
          )}
        </section>
      </div>

      {/* Sidebar Charts */}
        <aside className="news-sidebar">
          <div className="sidebar-section">
            <div className="section-header"><span className="section-title">산업군 이슈 TOP 5</span></div>
            <div className="keyword-list">
              {[{ name: "반도체", type: "긍정", val: "12%" }, { name: "IT서비스", type: "긍정", val: "9%" }, { name: "2차전지", type: "긍정", val: "7%" }, { name: "바이오", type: "중립", val: "0%" }, { name: "자동차", type: "부정", val: "5%" }].map(item => (
                <div className="keyword-item" key={item.name}>
                  <span className="kw-name">{item.name}</span>
                  <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", background: item.type === "긍정" ? "rgba(16, 185, 129, 0.1)" : item.type === "중립" ? "rgba(251, 191, 36, 0.1)" : "rgba(239, 68, 68, 0.1)", color: item.type === "긍정" ? "#10b981" : item.type === "중립" ? "#fbbf24" : "#ef4444" }}>{item.type}</span>
                  <span className={`kw-change ${item.type === "긍정" ? "up" : item.type === "부정" ? "down" : ""}`}>{item.type === "긍정" ? `▲ ${item.val}` : item.type === "부정" ? `▼ ${item.val}` : "0%"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="section-header"><span className="section-title">감성 분포 차트 ℹ️</span></div>
            <div style={{ width: "100%", height: "180px" }}>
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">{pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie></PieChart></ResponsiveContainer>
              <div style={{ textAlign: "center", marginTop: "-100px", marginBottom: "60px" }}><div style={{ fontSize: "11px", color: "#94a3b8" }}>전체 뉴스</div><div style={{ fontSize: "18px", fontWeight: 900 }}>1,248건</div></div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="section-header"><span className="section-title">실시간 인기 키워드</span></div>
            <div className="keyword-list">
              {topKeywords.map(kw => (
                <div className="keyword-item" key={kw.name} onClick={() => handleTagClick(kw.name)} style={{ cursor: "pointer" }}>
                  <span className="kw-rank">{kw.rank}</span>
                  <span className="kw-name">{kw.name}</span>
                  <span className={`kw-change ${kw.change >= 0 ? "up" : "down"}`}>{kw.change >= 0 ? `▲ ${kw.change}` : `▼ ${Math.abs(kw.change)}`}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default NewsPage;
