import { MonthlyPayment } from "../types/payment";

const MONTH_ABBR = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export interface PaymentTrendPoint {
  label: string;
  amount: number;
}

// Tendencia cronológica de los pagos de un usuario (últimos 12 registros)
export function buildUserPaymentTrend(
  payments: MonthlyPayment[],
): PaymentTrendPoint[] {
  const sorted = [...payments].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  );

  return sorted.slice(-12).map((payment) => ({
    label: `${MONTH_ABBR[payment.month - 1]} ${payment.year}`,
    amount: payment.amount,
  }));
}

// Tendencia agregada del sistema en los últimos N meses calendario (incluye meses en $0)
export function buildSystemPaymentTrend(
  payments: MonthlyPayment[],
  monthsBack = 6,
): PaymentTrendPoint[] {
  const now = new Date();
  const points: PaymentTrendPoint[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const amount = payments
      .filter((p) => p.year === year && p.month === month)
      .reduce((sum, p) => sum + p.amount, 0);

    points.push({ label: `${MONTH_ABBR[month - 1]} ${year}`, amount });
  }

  return points;
}
