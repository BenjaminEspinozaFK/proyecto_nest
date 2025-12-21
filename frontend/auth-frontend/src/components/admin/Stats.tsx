import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  useTheme,
} from "@mui/material";
import {
  CalendarToday,
  CalendarMonth,
  DateRange,
  LocalGasStation,
  HourglassEmpty,
  CheckCircle,
  AttachMoney,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { adminService } from "../../services/adminService";
import { voucherService } from "../../services/voucherService";
import { GasVoucher } from "../../types/voucher";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  usersToday: number;
  usersThisWeek: number;
  usersThisMonth: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    role: string;
  }>;
  recentLogins: Array<{
    id: string;
    name: string;
    email: string;
    lastLogin: string;
  }>;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
}

const CHART_COLORS = ["#667eea", "#764ba2", "#22c55e", "#f59e0b", "#3b82f6"];

const AdminStats: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");
  const [allVouchers, setAllVouchers] = useState<GasVoucher[]>([]);
  const [voucherStats, setVoucherStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    fetchVoucherData();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucherData = async () => {
    try {
      const [vouchers, vStats] = await Promise.all([
        voucherService.getAllVouchers(),
        voucherService.getGeneralStats(),
      ]);
      setAllVouchers(vouchers);
      setVoucherStats(vStats);
    } catch (error) {
      console.error("Error fetching voucher data:", error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Typography color="error">Error al cargar las estadísticas</Typography>
    );
  }

  // Preparar datos para gráficos de VALES
  const voucherStatusData = [
    {
      name: "Pendientes",
      value: allVouchers.filter((v) => v.status === "pending").length,
      color: "#f59e0b",
    },
    {
      name: "Aprobados",
      value: allVouchers.filter((v) => v.status === "approved").length,
      color: "#3b82f6",
    },
    {
      name: "Rechazados",
      value: allVouchers.filter((v) => v.status === "rejected").length,
      color: "#ef4444",
    },
    {
      name: "Entregados",
      value: allVouchers.filter((v) => v.status === "delivered").length,
      color: "#22c55e",
    },
  ];

  const voucherKilosData = [
    {
      name: "15 kg",
      cantidad: allVouchers.filter((v) => v.kilos === 15).length,
      monto: allVouchers
        .filter((v) => v.kilos === 15)
        .reduce((acc, v) => acc + (v.amount || 0), 0),
    },
    {
      name: "45 kg",
      cantidad: allVouchers.filter((v) => v.kilos === 45).length,
      monto: allVouchers
        .filter((v) => v.kilos === 45)
        .reduce((acc, v) => acc + (v.amount || 0), 0),
    },
  ];

  // Agrupar vales por mes (últimos 6 meses)
  const monthlyVoucherData = () => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    const currentMonth = new Date().getMonth();

    return months.map((month, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12;
      const vouchersInMonth = allVouchers.filter((v) => {
        const voucherMonth = new Date(v.requestDate).getMonth();
        return voucherMonth === monthIndex;
      });

      return {
        mes: month,
        vales: vouchersInMonth.length,
        pendientes: vouchersInMonth.filter((v) => v.status === "pending")
          .length,
        aprobados: vouchersInMonth.filter((v) => v.status === "approved")
          .length,
        entregados: vouchersInMonth.filter((v) => v.status === "delivered")
          .length,
      };
    });
  };

  const totalAmount = allVouchers.reduce((acc, v) => acc + (v.amount || 0), 0);
  const totalKilos = allVouchers.reduce((acc, v) => acc + v.kilos, 0);

  return (
    <Box>
      {/* Header con filtros */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <BarChartIcon
              sx={{
                fontSize: "2rem",
                color: isDark ? "#667eea" : "#764ba2",
              }}
            />
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Estadísticas de Vales de Gas
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitoreo en tiempo real de vales y distribución
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(_, newValue) => newValue && setTimeRange(newValue)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              "&.Mui-selected": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                },
              },
            },
          }}
        >
          <ToggleButton value="day">
            <CalendarToday sx={{ mr: 0.5, fontSize: 18 }} />
            Hoy
          </ToggleButton>
          <ToggleButton value="week">
            <DateRange sx={{ mr: 0.5, fontSize: 18 }} />
            Semana
          </ToggleButton>
          <ToggleButton value="month">
            <CalendarMonth sx={{ mr: 0.5, fontSize: 18 }} />
            Mes
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Cards de estadísticas principales */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Card
          sx={{
            background: "linear-gradient(135deg, #667eea22 0%, #764ba211 100%)",
            border: "1px solid #667eea44",
            borderRadius: "16px",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 12px 24px rgba(102, 126, 234, 0.2)",
            },
          }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  fontWeight={600}
                >
                  Total Vales
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ color: "#667eea" }}
                >
                  {voucherStats?.total || allVouchers.length}
                </Typography>
                <Chip
                  label={`${totalKilos.toLocaleString()} kg`}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: "#667eea22",
                    color: "#667eea",
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <LocalGasStation sx={{ fontSize: 36, color: "white" }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            background: "linear-gradient(135deg, #764ba222 0%, #667eea11 100%)",
            border: "1px solid #764ba244",
            borderRadius: "16px",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 12px 24px rgba(118, 75, 162, 0.2)",
            },
          }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  fontWeight={600}
                >
                  Pendientes
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ color: "#764ba2" }}
                >
                  {voucherStats?.pending ||
                    allVouchers.filter((v) => v.status === "pending").length}
                </Typography>
                <Chip
                  label="Por revisar"
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: "#764ba222",
                    color: "#764ba2",
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                }}
              >
                <HourglassEmpty sx={{ fontSize: 36, color: "white" }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            background: "linear-gradient(135deg, #22c55e22 0%, #16a34a11 100%)",
            border: "1px solid #22c55e44",
            borderRadius: "16px",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 12px 24px rgba(34, 197, 94, 0.2)",
            },
          }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  fontWeight={600}
                >
                  Entregados
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ color: "#22c55e" }}
                >
                  {voucherStats?.delivered ||
                    allVouchers.filter((v) => v.status === "delivered").length}
                </Typography>
                <Chip
                  label="Completados"
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: "#22c55e22",
                    color: "#22c55e",
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                }}
              >
                <CheckCircle sx={{ fontSize: 36, color: "white" }} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            background:
              "linear-gradient(135deg, #f59e0b22 0%, #d97706 11 100%)",
            border: "1px solid #f59e0b44",
            borderRadius: "16px",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 12px 24px rgba(245, 158, 11, 0.2)",
            },
          }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  fontWeight={600}
                >
                  Monto Total
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ color: "#f59e0b" }}
                >
                  ${(voucherStats?.totalAmount || totalAmount).toLocaleString()}
                </Typography>
                <Chip
                  label="Distribuido"
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: "#f59e0b22",
                    color: "#f59e0b",
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                }}
              >
                <AttachMoney sx={{ fontSize: 36, color: "white" }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Gráficos Principales */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Gráfico de Distribución de Vales por Estado (Pie Chart) */}
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
                ? "0 8px 30px rgba(102, 126, 234, 0.3)"
                : "0 8px 30px rgba(102, 126, 234, 0.15)",
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
              📊
            </Box>
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Estado de Vales
            </Box>
          </Typography>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <defs>
                <filter id="shadow" height="200%">
                  <feDropShadow
                    dx="0"
                    dy="4"
                    stdDeviation="4"
                    floodOpacity="0.3"
                  />
                </filter>
              </defs>
              <Pie
                data={voucherStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={110}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                animationBegin={0}
                animationDuration={800}
              >
                {voucherStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.color || CHART_COLORS[index % CHART_COLORS.length]
                    }
                    filter="url(#shadow)"
                  />
                ))}
              </Pie>
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
                labelStyle={{
                  color: isDark ? "#ffffff" : "#000000",
                  fontWeight: 600,
                }}
                itemStyle={{
                  color: isDark ? "#ffffff" : "#000000",
                }}
                formatter={(value, name) => [`${value} vales`, name]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: isDark ? "#e0e0e0" : "#000000",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Gráfico de Distribución por Kilos (Bar Chart) */}
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
                ? "0 8px 30px rgba(102, 126, 234, 0.3)"
                : "0 8px 30px rgba(102, 126, 234, 0.15)",
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
              📈
            </Box>
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Distribución por Kilos
            </Box>
          </Typography>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={voucherKilosData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#667eea" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#764ba2" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0.7} />
                </linearGradient>
                <filter id="barShadow">
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="3"
                    floodOpacity="0.3"
                  />
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#444" : "#e0e0e0"}
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                stroke={isDark ? "#e0e0e0" : "#666"}
                style={{ fontSize: "14px", fontWeight: 600 }}
              />
              <YAxis
                stroke={isDark ? "#e0e0e0" : "#666"}
                style={{ fontSize: "12px" }}
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
                cursor={{
                  fill: isDark
                    ? "rgba(102, 126, 234, 0.2)"
                    : "rgba(102, 126, 234, 0.1)",
                }}
                formatter={(value, name) => {
                  if (!value) return ["0", name];
                  if (name === "monto")
                    return [`$${value.toLocaleString()}`, "Monto"];
                  return [value, "Cantidad"];
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: isDark ? "#e0e0e0" : "#000000",
                }}
                iconType="circle"
              />
              <Bar
                dataKey="cantidad"
                fill="url(#colorGradient1)"
                radius={[12, 12, 0, 0]}
                filter="url(#barShadow)"
                animationBegin={0}
                animationDuration={800}
              />
              <Bar
                dataKey="monto"
                fill="url(#colorGradient2)"
                radius={[12, 12, 0, 0]}
                filter="url(#barShadow)"
                animationBegin={200}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Gráfico de Tendencia de Vales (Area Chart) */}
      <Paper
        sx={{
          p: 3,
          borderRadius: "20px",
          boxShadow: isDark
            ? "0 4px 20px rgba(0, 0, 0, 0.5)"
            : "0 4px 20px rgba(0, 0, 0, 0.08)",
          mb: 3,
          background: isDark
            ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: isDark
              ? "0 8px 30px rgba(102, 126, 234, 0.3)"
              : "0 8px 30px rgba(102, 126, 234, 0.15)",
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
            📉
          </Box>
          <Box
            component="span"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Tendencia de Solicitudes (Últimos 6 Meses)
          </Box>
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={monthlyVoucherData()}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="areaGradient3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} />
              </linearGradient>
              <filter id="areaShadow">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="2"
                  floodOpacity="0.2"
                />
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#444" : "#e0e0e0"}
              vertical={false}
              opacity={0.5}
            />
            <XAxis
              dataKey="mes"
              stroke={isDark ? "#e0e0e0" : "#666"}
              style={{ fontSize: "14px", fontWeight: 600 }}
            />
            <YAxis
              stroke={isDark ? "#e0e0e0" : "#666"}
              style={{ fontSize: "12px" }}
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
              cursor={{
                stroke: "#667eea",
                strokeWidth: 2,
                strokeDasharray: "5 5",
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "14px",
                fontWeight: 600,
                color: isDark ? "#e0e0e0" : "#000000",
              }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="vales"
              stroke="#667eea"
              fill="url(#areaGradient)"
              strokeWidth={3}
              name="Total Vales"
              filter="url(#areaShadow)"
              animationBegin={0}
              animationDuration={1000}
              dot={{ fill: "#667eea", strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="pendientes"
              stroke="#f59e0b"
              fill="url(#areaGradient2)"
              strokeWidth={3}
              name="Pendientes"
              animationBegin={200}
              animationDuration={1000}
              dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 7, strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="entregados"
              stroke="#22c55e"
              fill="url(#areaGradient3)"
              strokeWidth={3}
              name="Entregados"
              animationBegin={400}
              animationDuration={1000}
              dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 7, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Usuarios recientes */}
        <Paper
          sx={{
            p: 3,
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
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
              👥
            </Box>
            <Box component="span">Últimos Usuarios Registrados</Box>
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Rol</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Registrado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Últimos logins */}
        <Paper
          sx={{
            p: 3,
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
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
              🔐
            </Box>
            <Box component="span">Últimos Inicios de Sesión</Box>
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Último Login
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentLogins.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "Nunca"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminStats;
