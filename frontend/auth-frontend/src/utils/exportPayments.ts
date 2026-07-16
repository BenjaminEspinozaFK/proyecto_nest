import * as XLSX from "xlsx";
import { MonthlyPayment } from "../types/payment";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Exporta el historial de pagos de un solo usuario a Excel
export function exportPaymentsToExcel(
  payments: MonthlyPayment[],
  fileName: string,
) {
  const rows = payments.map((payment) => ({
    "Fecha de Pago": new Date(payment.paymentDate).toLocaleDateString(
      "es-CL",
    ),
    Año: payment.year,
    Mes: MONTH_NAMES[payment.month - 1],
    Monto: payment.amount,
    Descripción: payment.description || "",
  }));

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  rows.push({
    "Fecha de Pago": "",
    Año: "" as unknown as number,
    Mes: "",
    Monto: totalAmount,
    Descripción: "TOTAL",
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 8 },
    { wch: 12 },
    { wch: 14 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos");
  XLSX.writeFile(workbook, fileName);
}

// Exporta el historial de pagos de TODOS los usuarios a Excel (vista admin)
export function exportAllPaymentsToExcel(
  payments: MonthlyPayment[],
  fileName: string,
) {
  const rows = payments.map((payment) => ({
    Usuario: payment.user?.name || "",
    Email: payment.user?.email || "",
    RUT: payment.user?.rut || "",
    "Fecha de Pago": new Date(payment.paymentDate).toLocaleDateString(
      "es-CL",
    ),
    Año: payment.year,
    Mes: MONTH_NAMES[payment.month - 1],
    Monto: payment.amount,
    Descripción: payment.description || "",
  }));

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  rows.push({
    Usuario: "",
    Email: "",
    RUT: "",
    "Fecha de Pago": "",
    Año: "" as unknown as number,
    Mes: "",
    Monto: totalAmount,
    Descripción: "TOTAL GENERAL",
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 24 },
    { wch: 28 },
    { wch: 14 },
    { wch: 14 },
    { wch: 8 },
    { wch: 12 },
    { wch: 14 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos");
  XLSX.writeFile(workbook, fileName);
}
