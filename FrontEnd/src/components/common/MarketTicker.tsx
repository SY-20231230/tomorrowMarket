import React from "react";
import "./MarketTicker.css";

const MarketTicker: React.FC = () => {
  const tickerData = [
    { n: "KOSPI", v: "2,874.32", c: "▲ 1.12%", up: true },
    { n: "KOSDAQ", v: "914.85", c: "▲ 0.76%", up: true },
    { n: "삼성전자", v: "78,900", c: "▲ 2.31%", up: true },
    { n: "SK하이닉스", v: "182,500", c: "▲ 3.18%", up: true },
    { n: "USD/KRW", v: "1,368.50", c: "▼ 0.24%", up: false }
  ];

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
              {tickerData.map((item, i) => (
                <div className="ticker-item" key={`${groupIdx}-${i}`}>
                  <span className="ticker-name">{item.n}</span>
                  <span className="ticker-value">{item.v}</span>
                  <span className={`ticker-change ${item.up ? "up" : "down"}`}>
                    {item.c}
                  </span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
