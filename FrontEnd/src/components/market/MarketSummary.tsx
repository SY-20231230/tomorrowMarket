import MarketIndexCard from "./MarketIndexCard";
import { mockMarket } from "../../data/mockMarket";
import "./MarketSummary.css";

type MarketSummaryProps = {
  onAction?: (marketName: string, mode: "past" | "ai") => void;
};

function MarketSummary({ onAction }: MarketSummaryProps) {
  return (
    <div className="market-summary-grid">
      {mockMarket.map((market) => (
        <MarketIndexCard
          key={market.name}
          name={market.name}
          value={market.value}
          changeRate={market.changeRate}
          prediction={market.name === "KOSPI" || market.name === "KOSDAQ" ? "긍정" : "부정"} // Mock prediction
          onAction={(mode) => onAction?.(market.name, mode)}
        />
      ))}
    </div>
  );
}

export default MarketSummary;