import { useNavigate, useParams } from "react-router-dom";
import "./NewsDetailPage.css";

import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from "recharts";

const NewsDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data for the prediction chart
  const predictionData = [
    { day: "발표 전", actual: 78900, predicted: 78900 },
    { day: "발표 시점", actual: 80200, predicted: 80500 },
    { day: "+1일", predicted: 82000 },
    { day: "+3일", predicted: 83500 },
    { day: "+5일", predicted: 85000 },
  ];

  const sentimentData = [
    { name: "긍정", value: 85, color: "#10b981" },
    { name: "중립", value: 10, color: "#64748b" },
    { name: "부정", value: 5, color: "#ef4444" },
  ];

  return (
    <div className="news-detail-page">
      <div className="detail-navigation">
        <button className="back-btn" onClick={() => navigate("/news")}>
          <span className="back-icon">←</span> 뉴스 모음으로 돌아가기
        </button>
      </div>

      <div className="detail-container">
        {/* Left Column: Content */}
        <main className="detail-main-content">
          <div className="detail-header">
            <div className="detail-category-tags">
              <span className="detail-tag">산업·기업</span>
              <span className="detail-tag">AI·반도체</span>
              <span className="detail-tag">삼성전자</span>
            </div>
            <div className="detail-actions">
              <button className="action-btn">북마크</button>
              <button className="action-btn">공유</button>
            </div>
          </div>

          <h1 className="detail-title">엔비디아 실적 호조에 국내 AI 반도체 관련주 강세</h1>
          <div className="detail-meta">
            <span className="detail-source">한국경제</span>
            <span className="detail-time-group">
              <span className="detail-date">2025.05.22 09:15</span>
              <span className="detail-update">수정 2025.05.22 09:32</span>
            </span>
          </div>

          <div className="detail-hero-image">
            <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000" alt="NVIDIA AI" />
            <div className="image-overlay"></div>
          </div>

          <section className="detail-section detail-summary">
            <div className="section-title-group">
              <span className="ai-badge">✨ AI 요약</span>
            </div>
            <p className="ai-summary-text">
              엔비디아의 1분기 실적이 시장 예상치를 상회하며 AI 반도체 수요 기대감이 커지고 있습니다. 
              특히 데이터센터 AI 칩 수요가 견조하게 유지되면서 국내 반도체 장비 및 소재 업체들의 수혜가 예상됩니다. 전문가는 단기적으로 관련주 강세가 이어질 가능성이 높다고 분석합니다.
            </p>
            <button className="original-link-btn">전체 기사 원문 보기 →</button>
          </section>

          <section className="detail-section detail-key-points">
            <h3 className="sub-section-title">핵심 내용</h3>
            <ul className="key-points-list">
              <li>엔비디아 1분기 매출 260억 달러, 전년 대비 262% 증가</li>
              <li>데이터센터 매출 226억 달러로 시장 예상치 상회</li>
              <li>AI 칩(H100, Blackwell) 수요 강력, 공급 부족 지속</li>
              <li>국내 반도체 장비·소재 업체 실적 개선 기대</li>
              <li>단기적으로 관련주 투자심리 긍정적 유지 전망</li>
            </ul>
          </section>

          <section className="detail-section detail-related-stocks">
            <h3 className="sub-section-title">관련 종목</h3>
            <div className="related-stocks-grid">
              {[
                { name: "삼성전자", price: "78,900", change: "+2.31%" },
                { name: "SK하이닉스", price: "182,500", change: "+3.18%" },
                { name: "한미반도체", price: "102,700", change: "+4.25%" },
                { name: "이오테크닉스", price: "213,500", change: "+2.87%" }
              ].map(stock => (
                <div key={stock.name} className="related-stock-item">
                  <span className="stock-name">{stock.name}</span>
                  <span className="stock-price">{stock.price}</span>
                  <span className="stock-change">{stock.change}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Right Column: AI Analysis Sidebar */}
        <aside className="detail-sidebar">
          <div className="sidebar-analysis-card">
            <h3 className="sidebar-card-title">AI 감성 분석 <span className="info-icon">?</span></h3>
            <div className="sentiment-gauge-container">
              <div className="gauge-header">
                <span className="sentiment-label positive">긍정</span>
                <span className="sentiment-score">85 / 100</span>
              </div>
              <div className="sentiment-distribution">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="gauge-center-text">
                  <span className="center-score">92%</span>
                  <span className="center-label">신뢰도</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-analysis-card">
            <h3 className="sidebar-card-title">시장 영향 분석 <span className="info-icon">?</span></h3>
            <div className="impact-stats">
              <div className="impact-item">
                <span className="impact-label">시장 영향</span>
                <span className="impact-value positive">▲ 상승 가능성</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">영향도</span>
                <span className="impact-value high">HIGH</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">지속 기간</span>
                <span className="impact-value">단기~중기</span>
              </div>
            </div>
          </div>

          <div className="sidebar-analysis-card">
            <h3 className="sidebar-card-title">관련 종목 예상 주가 반응</h3>
            <div className="prediction-chart-container" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6" }} />
                  <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={{ fill: "#10b981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="sidebar-analysis-card ai-opinion-card">
            <h3 className="sidebar-card-title">AI 종합 의견</h3>
            <p className="ai-opinion-text">
              엔비디아의 실적 호조는 AI 반도체 산업의 구조적 성장세를 재확인시켜주는 뉴스입니다. 국내 관련 기업들의 수혜가 기대되며, 단기적으로 투자심리에 긍정적인 영향을 미칠 가능성이 높습니다.
            </p>
            <div className="ai-conclusion">
              <span className="conclusion-label">종합 의견</span>
              <span className="conclusion-value">매수 우위</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default NewsDetailPage;
