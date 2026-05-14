import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { mockChartData } from "../../data/mockChartData";

function StockChart() {
  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        backgroundColor: "#1e293b",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockChartData}>
          <XAxis dataKey="date" stroke="#94a3b8" />

          <YAxis stroke="#94a3b8" />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;
