import "./StockCard.css";

type StockCardProps = {
  name: string;
  price: number;
  changeRate: number;
  prediction: string;
};

function StockCard({
  name,
  price,
  changeRate,
  prediction,
}: StockCardProps) {
  const isPositive = changeRate >= 0;

  return (
    <div className="stock-card">
      <h3>{name}</h3>

      <p className="stock-price">
        {price.toLocaleString()}원
      </p>

      <p
        className={
          isPositive
            ? "stock-change positive"
            : "stock-change negative"
        }
      >
        {isPositive ? "+" : ""}
        {changeRate}%
      </p>

      <div className="stock-prediction">
        AI 감성분석 : {prediction}
      </div>
    </div>
  );
}

export default StockCard;