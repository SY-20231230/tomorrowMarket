import "./StockTable.css";

type Stock = {
  code: string;
  name: string;
  price: number;
  changeRate: number;
};

type StockTableProps = {
  stocks: Stock[];
};

function StockTable({ stocks }: StockTableProps) {
  return (
    <table className="stock-table">
      <thead>
        <tr>
          <th>종목명</th>
          <th>현재가</th>
          <th>등락률</th>
        </tr>
      </thead>

      <tbody>
        {stocks.map((stock) => (
          <tr key={stock.code}>
            <td>{stock.name}</td>

            <td>
              {stock.price.toLocaleString()}원
            </td>

            <td
              className={
                stock.changeRate >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {stock.changeRate >= 0 ? "+" : ""}
              {stock.changeRate}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default StockTable;