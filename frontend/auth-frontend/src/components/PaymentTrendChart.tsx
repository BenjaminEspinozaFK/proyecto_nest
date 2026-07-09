import React from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PaymentTrendPoint } from "../utils/paymentTrends";

interface PaymentTrendChartProps {
  data: PaymentTrendPoint[];
  title?: string;
  emoji?: string;
  height?: number;
}

const PaymentTrendChart: React.FC<PaymentTrendChartProps> = ({
  data,
  title = "Tendencia de Pagos",
  emoji = "💰",
  height = 300,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: "20px",
        boxShadow: isDark
          ? "0 4px 20px rgba(0, 0, 0, 0.5)"
          : "0 4px 20px rgba(0, 0, 0, 0.08)",
        background: isDark
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isDark
            ? "0 8px 30px rgba(16, 185, 129, 0.3)"
            : "0 8px 30px rgba(16, 185, 129, 0.15)",
        },
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        fontWeight="bold"
        mb={2}
        sx={{
          color: isDark ? "#e0e0e0" : "#1a1a1a",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box component="span" sx={{ fontSize: "1.2em" }}>
          {emoji}
        </Box>
        <Box
          component="span"
          sx={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </Box>
      </Typography>

      {data.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No hay datos suficientes para mostrar la tendencia.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="paymentTrendGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#444" : "#e0e0e0"}
              vertical={false}
              opacity={0.5}
            />
            <XAxis
              dataKey="label"
              stroke={isDark ? "#e0e0e0" : "#666"}
              style={{ fontSize: "13px", fontWeight: 600 }}
            />
            <YAxis
              stroke={isDark ? "#e0e0e0" : "#666"}
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.95)"
                  : "rgba(255, 255, 255, 0.95)",
                color: isDark ? "#ffffff" : "#000000",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                padding: "12px 16px",
              }}
              formatter={(value) => [
                `$${Number(value).toLocaleString()}`,
                "Monto",
              ]}
              cursor={{
                stroke: "#10b981",
                strokeWidth: 2,
                strokeDasharray: "5 5",
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              fill="url(#paymentTrendGradient)"
              strokeWidth={3}
              name="Monto"
              dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default PaymentTrendChart;
