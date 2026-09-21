import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SectionTitle from "../components/common/SectionTitle";
import api from "../api/axios";
import "./HomePage.css"; // Reuse some styles

interface Stock {
  stockId: number;
  name: string;
  stockCode: string;
  marketType: string;
  sectorId: number;
  sectorName: string;
  closingPrice: number;
  performance: number;
}

interface Sector {
  sectorId: number;
  name: string;
}

function StockListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<number[]>([]);

  useEffect(() => {
    // Fetch initial watchlists
    api.get("/watchlists")
      .then(res => {
        if (res.data?.data) {
          setWatchlistIds(res.data.data.map((w: any) => w.stockId));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await api.get("/sectors");
        if (response.data?.data) {
          setSectors(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch sectors:", error);
      }
    };
    fetchSectors();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(0); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Reset page when sector changes
  useEffect(() => {
    setPage(0);
  }, [selectedSectorId]);

  // Fetch Logic
  useEffect(() => {
    const fetchStocks = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page: page,
          size: 10,
        };
        
        if (debouncedKeyword.trim() !== "") {
          params.keyword = debouncedKeyword;
        }
        
        if (selectedSectorId !== null) {
          params.sectorId = selectedSectorId;
        }

        const response = await api.get("/stocks", { params });
        if (response.data && response.data.data) {
          setStocks(response.data.data.content || []);
          setTotalPages(response.data.data.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch stocks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, [debouncedKeyword, selectedSectorId, page]);

  const toggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      if (watchlistIds.includes(id)) {
        await api.delete(`/watchlists/${id}`);
        setWatchlistIds(prev => prev.filter(wid => wid !== id));
        alert("관심 종목에서 해제되었습니다.");
      } else {
        await api.post(`/watchlists/${id}`);
        setWatchlistIds(prev => [...prev, id]);
        alert("관심 종목에 추가되었습니다.");
      }
    } catch (err) {
      alert("관심 종목 처리에 실패했습니다.");
    }
  };

  return (
    <div className="home-page" style={{ paddingBottom: "100px" }}>
      <SectionTitle
        title="주식 조회"
        description="다양한 종목을 검색하고 상세 분석 리포트를 확인하세요."
      />

      {/* Search and Filters */}
      <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <input 
          type="text" 
          placeholder="종목명 또는 종목 코드를 입력하세요 🔍"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            width: "100%",
            padding: "20px 24px",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(0, 0, 0, 0.2)",
            color: "#fff",
            fontSize: "18px",
            outline: "none",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            transition: "0.2s"
          }}
          onFocus={(e) => e.target.style.border = "1px solid var(--cyan)"}
          onBlur={(e) => e.target.style.border = "1px solid rgba(255, 255, 255, 0.1)"}
        />

        {/* Categories / Sectors */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedSectorId(null)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              background: selectedSectorId === null ? "var(--cyan)" : "rgba(255, 255, 255, 0.05)",
              color: selectedSectorId === null ? "#000" : "var(--text-soft)",
              fontSize: "15px",
              fontWeight: selectedSectorId === null ? "900" : "bold",
              cursor: "pointer",
              transition: "0.2s"
            }}
          >
            전체 산업군
          </button>
          {sectors.map(sector => (
            <button
              key={sector.sectorId}
              onClick={() => setSelectedSectorId(sector.sectorId)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "none",
                background: selectedSectorId === sector.sectorId ? "var(--cyan)" : "rgba(255, 255, 255, 0.05)",
                color: selectedSectorId === sector.sectorId ? "#000" : "var(--text-soft)",
                fontSize: "15px",
                fontWeight: selectedSectorId === sector.sectorId ? "900" : "bold",
                cursor: "pointer",
                transition: "0.2s"
              }}
            >
              {sector.name}
            </button>
          ))}
        </div>
      </div>

      {/* Data Grid */}
      <div style={{
        marginTop: "32px",
        background: "var(--bg-card)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        overflow: "hidden"
      }}>
        {/* Table Header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 60px", padding: "16px 24px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", color: "var(--text-soft)", fontSize: "14px", fontWeight: "bold" }}>
          <span>종목명 (코드)</span>
          <span style={{ textAlign: "right" }}>시장</span>
          <span style={{ textAlign: "right" }}>현재가 (등락률)</span>
          <span style={{ textAlign: "right" }}>섹터</span>
          <span></span>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "2fr 1fr 1.5fr 1fr 60px", 
                  padding: "20px 24px", 
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ width: "120px", height: "20px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", animation: "pulse 1.5s infinite" }}></div>
                  <div style={{ width: "80px", height: "14px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", animation: "pulse 1.5s infinite" }}></div>
                </div>
                <div style={{ width: "60px", height: "18px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", marginLeft: "auto", animation: "pulse 1.5s infinite" }}></div>
                <div style={{ width: "30px", height: "18px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", marginLeft: "auto", animation: "pulse 1.5s infinite" }}></div>
                <div style={{ width: "80px", height: "18px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", marginLeft: "auto", animation: "pulse 1.5s infinite" }}></div>
                <div style={{ width: "24px", height: "24px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", marginLeft: "auto", animation: "pulse 1.5s infinite" }}></div>
              </div>
            ))}
          </div>
        ) : stocks.length > 0 ? (
          stocks.map((stock) => (
            <div 
              key={stock.stockId} 
              onClick={() => navigate(`/stocks/${stock.stockId}`)}
              style={{ 
                display: "grid", 
                gridTemplateColumns: "2fr 1fr 1.5fr 1fr 60px", 
                padding: "20px 24px", 
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                alignItems: "center",
                cursor: "pointer",
                transition: "0.2s"
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ color: "#fff", fontSize: "17px", fontWeight: "900" }}>{stock.name}</span>
                <span style={{ color: "var(--text-soft)", fontSize: "13px" }}>{stock.stockCode}</span>
              </div>
              <span style={{ color: "#fff", fontSize: "15px", fontWeight: "bold", textAlign: "right" }}>
                {stock.marketType || "-"}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end" }}>
                <span style={{ color: "#fff", fontSize: "16px", fontWeight: "900" }}>
                  {stock.closingPrice != null ? stock.closingPrice.toLocaleString() + "원" : "-"}
                </span>
                <span style={{ color: stock.performance != null ? (stock.performance > 0 ? "#22c55e" : stock.performance < 0 ? "#ef4444" : "#6b7280") : "#6b7280", fontSize: "13px", fontWeight: "bold" }}>
                  {stock.performance != null ? (stock.performance > 0 ? "▲" : stock.performance < 0 ? "▼" : "") + " " + Math.abs(stock.performance).toFixed(2) + "%" : ""}
                </span>
              </div>
              <span style={{ color: "var(--text-soft)", fontSize: "14px", textAlign: "right" }}>
                {stock.sectorName || "-"}
              </span>
              <div style={{ textAlign: "right" }}>
                <button 
                  onClick={(e) => toggleFavorite(e, stock.stockId)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", color: watchlistIds.includes(stock.stockId) ? "#eab308" : "rgba(255,255,255,0.2)" }}
                >
                  ★
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-soft)" }}>
            조회된 종목이 없습니다.
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "32px", gap: "8px" }}>
          <button 
            disabled={page === 0} 
            onClick={() => setPage(p => p - 1)}
            style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", cursor: page === 0 ? "not-allowed" : "pointer" }}
          >
            &lt;
          </button>
          
          <span style={{ padding: "8px 16px", background: "var(--cyan)", borderRadius: "8px", color: "#000", fontWeight: "bold" }}>
            {page + 1} / {totalPages}
          </span>
          
          <button 
            disabled={page === totalPages - 1} 
            onClick={() => setPage(p => p + 1)}
            style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", cursor: page === totalPages - 1 ? "not-allowed" : "pointer" }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}

export default StockListPage;
