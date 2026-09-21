import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import "./MarketTicker.css";

const MarketTicker: React.FC = () => {
  const [tickerData, setTickerData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch top 5 stocks
    api.get("/stocks?page=0&size=5").then(res => {
      if (res.data && res.data.data && res.data.data.content) {
        setTickerData(res.data.data.content);
      }
    }).catch(console.error);
  }, []);

  if (tickerData.length === 0) return null;

  return (
    <div className="market-ticker-container">
      <div className="ticker-label-container">
        <span className="ticker-label">MARKET TICKER</span>
      </div>
      <div className="ticker-wrapper">
        <div className="ticker-items">
          {/* 무한 루프를 위해 동일한 리스트를 두 번 렌더링 */}
          {[1, 2].map((_, groupIdx) => (
            <React.Fragment key={groupIdx}>
              {tickerData.map((item, i) => {
                const isUp = item.performance > 0;
                return (
                  <div className="ticker-item" key={`${groupIdx}-${i}`}>
                    <span className="ticker-name">{item.name}</span>
                    <span className="ticker-value">{item.closingPrice.toLocaleString()}</span>
                    <span className={`ticker-change ${isUp ? "up" : "down"}`}>
                      {isUp ? "▲" : "▼"} {Math.abs(item.performance).toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
