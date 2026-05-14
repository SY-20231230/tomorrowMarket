import React from "react";
import SectionTitle from "../components/common/SectionTitle";
import "./AdminPage.css";

function AdminPage() {
  // --- 1. 상태 배지 컴포넌트 ---
  const HealthPill = ({ label, status }: { label: string; status: string }) => (
    <div className="health-pill">
      <div className="status-dot dot-online"></div>
      <span style={{ color: "#94a3b8", marginRight: "4px" }}>{label}</span>
      <span style={{ color: "#10b981" }}>{status}</span>
    </div>
  );

  // --- 2. 통계 카드 컴포넌트 (미니 차트 포함) ---
  const StatCard = ({ label, value, trend, icon, color }: any) => (
    <div className="admin-card">
      <div className="card-icon-wrap" style={{ color }}>{icon}</div>
      <div className="card-label">{label}</div>
      <div className="card-value">{value}</div>
      <div className={`card-trend ${trend.startsWith('+') ? 'trend-up' : ''}`}>
        {trend.startsWith('+') ? '▲' : '▼'} {trend} <span style={{ color: "#64748b", fontWeight: 700, marginLeft: "4px" }}>전일 대비</span>
      </div>
      {/* 미니 차트 (SVG) */}
      <svg className="mini-chart-bg" viewBox="0 0 100 40" preserveAspectRatio="none">
        <path 
          d="M0 40 Q 25 35, 50 20 T 100 15 L 100 40 L 0 40 Z" 
          fill={color} 
          fillOpacity="0.1" 
        />
        <path 
          d="M0 40 Q 25 35, 50 20 T 100 15" 
          fill="none" 
          stroke={color} 
          strokeWidth="2" 
        />
      </svg>
    </div>
  );

  return (
    <div className="admin-container">
      {/* 상단 시스템 상태 바 */}
      <div className="system-health-bar">
        <HealthPill label="AI MODEL" status="ONLINE" />
        <HealthPill label="NEWS PIPELINE" status="ACTIVE" />
        <HealthPill label="DB HEALTH" status="NORMAL" />
        <HealthPill label="GPU STATUS" status="NORMAL" />
      </div>

      <SectionTitle title="관리자 대시보드" description="시스템 운영 현황과 주요 데이터를 실시간으로 모니터링하세요." />

      {/* 중앙 1열: 통계 카드 */}
      <div className="admin-stat-grid" style={{ marginTop: "24px" }}>
        <StatCard label="전체 사용자" value="1,248 명" trend="+ 12.4%" icon="👤" color="#a855f7" />
        <StatCard label="오늘 조회 수" value="8,932 회" trend="+ 18.7%" icon="👁" color="#22d3ee" />
        <StatCard label="수집 뉴스" value="456 건" trend="+ 8.1%" icon="📰" color="#10b981" />
        <div className="admin-card">
          <div className="card-icon-wrap" style={{ color: "#f43f5e" }}>🧠</div>
          <div className="card-label">AI 모델 상태</div>
          <div className="card-value" style={{ color: "#10b981", fontSize: "24px" }}>OPERATIONAL</div>
          <div className="card-trend">정상 운영 중</div>
        </div>
      </div>

      {/* 중앙 2열: 시각화 허브 */}
      <div className="admin-viz-row">
        {/* 시간대별 트래픽 (에어리어 차트) */}
        <div className="admin-card">
          <div className="viz-title">
            <span>시간대별 사용자 조회량</span>
            <span style={{ fontSize: "11px", color: "#10b981" }}>● 실시간</span>
          </div>
          <div style={{ height: "180px", position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none">
               <defs>
                 <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                   <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                 </linearGradient>
               </defs>
               <path d="M0 150 L0 120 C 50 130, 80 40, 150 60 S 250 140, 320 80 S 380 40, 400 50 L 400 150 Z" fill="url(#areaGrad)" />
               <path d="M0 120 C 50 130, 80 40, 150 60 S 250 140, 320 80 S 380 40, 400 50" fill="none" stroke="#a855f7" strokeWidth="3" />
               {/* 포인트 */}
               <circle cx="150" cy="60" r="4" fill="#fff" stroke="#a855f7" strokeWidth="2" />
               <text x="160" y="50" fill="#fff" fontSize="10" fontWeight="900">12:00 (1,842)</text>
            </svg>
          </div>
        </div>

        {/* AI 예측 정확도 (도넛 차트) */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="viz-title" style={{ alignSelf: "stretch" }}>AI 예측 정확도 추이</div>
          <div style={{ position: "relative", width: "140px", height: "140px" }}>
            <svg width="140" height="140" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#22d3ee" strokeWidth="12" strokeDasharray="190 251" strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: 950 }}>78.2%</div>
              <div style={{ fontSize: "10px", color: "#94a3b8" }}>정확도</div>
            </div>
          </div>
          <div style={{ marginTop: "20px", width: "100%", fontSize: "11px", display: "grid", gap: "8px" }}>
             <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#22d3ee" }}>● 정확 예측</span> <span>78.2%</span></div>
             <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#6366f1" }}>● 보통 예측</span> <span>16.3%</span></div>
             <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#f43f5e" }}>● 오차 예측</span> <span>5.5%</span></div>
          </div>
        </div>

        {/* AI 모델 상태 상세 */}
        <div className="admin-card">
          <div className="viz-title">AI 모델 상태</div>
          <div className="monitor-item"><span className="monitor-label">Model Version</span><span className="monitor-value">v2.3.7</span></div>
          <div className="monitor-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span className="monitor-label">Inference Latency</span><span className="monitor-value">42ms</span>
            </div>
            <div className="progress-bar-wrap" style={{ width: "100%" }}><div className="progress-fill" style={{ width: "42%" }}></div></div>
          </div>
          <div className="monitor-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span className="monitor-label">GPU Usage</span><span className="monitor-value">66%</span>
            </div>
            <div className="progress-bar-wrap" style={{ width: "100%" }}><div className="progress-fill" style={{ width: "66%", background: "#f59e0b" }}></div></div>
          </div>
          <div className="monitor-item"><span className="monitor-label">Last Update</span><span className="monitor-value">2024-11-15 09:15</span></div>
          <button className="btn-restart">🔄 모델 재시작</button>
        </div>
      </div>

      {/* 하단: 로그 & 이벤트 */}
      <div className="admin-bottom-row">
        <div className="log-terminal">
          <div className="terminal-header">
            <span style={{ fontSize: "14px", fontWeight: 900 }}>시스템 로그</span>
            <button style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "12px", cursor: "pointer" }}>전체 보기 ▾</button>
          </div>
          <div className="log-list">
            {[
              { time: "10:24:12", badge: "INFO", text: "AI 예측 엔진 모델 업데이트 완료", type: "info" },
              { time: "10:15:05", badge: "NEWS", text: "신규 뉴스 크롤링 완료 (32건)", type: "info" },
              { time: "09:42:33", badge: "DB", text: "데이터베이스 자동 백업 실행", type: "info" },
              { time: "09:30:11", badge: "WARN", text: "API 응답 지연 감지 (124ms)", type: "warn" },
              { time: "09:15:22", badge: "INFO", text: "AI 모델 학습 스케줄 시작", type: "info" },
            ].map((log, i) => (
              <div key={i} className="log-entry">
                <span className="log-time">{log.time}</span>
                <span className={`log-badge badge-${log.type}`}>{log.badge}</span>
                <span style={{ color: "#cbd5e1" }}>{log.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="log-terminal">
          <div className="terminal-header">
            <span style={{ fontSize: "14px", fontWeight: 900 }}>최근 위험 감지 / AI 분석 이벤트</span>
            <button style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "12px", cursor: "pointer" }}>전체 보기 ▾</button>
          </div>
          <div className="log-list">
            {[
              { time: "12:45:21", stock: "삼성전자", msg: "단기 변동성 상승 감지", status: "위험", type: "danger" },
              { time: "12:30:15", stock: "2차전지 섹터", msg: "투자 심리 악화 감지", status: "경고", type: "warn" },
              { time: "12:15:08", stock: "AI/플랫폼 섹터", msg: "긍정 뉴스 증가", status: "정상", type: "normal" },
            ].map((ev, i) => (
              <div key={i} className="log-entry">
                <span className="log-time">{ev.time}</span>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ color: "var(--cyan)", fontWeight: 900 }}>{ev.stock}</div>
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>{ev.msg}</div>
                </div>
                <span className={`event-severity severity-${ev.type === 'danger' ? 'danger' : ev.type === 'normal' ? 'normal' : 'warn'}`}>
                  {ev.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;