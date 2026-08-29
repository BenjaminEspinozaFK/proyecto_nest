import { Workbook, Worksheet } from "exceljs";
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

// Dispara la descarga de un workbook en el navegador
async function downloadWorkbook(workbook: Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function addTotalRow(worksheet: Worksheet, totalAmount: number) {
  const row = worksheet.addRow({});
  row.getCell("monto").value = totalAmount;
  row.getCell("descripcion").value = "TOTAL";
  row.font = { bold: true };
}

// Exporta el historial de pagos de un solo usuario a Excel
export async function exportPaymentsToExcel(
  payments: MonthlyPayment[],
  fileName: string,
) {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Pagos");

  worksheet.columns = [
    { header: "Fecha de Pago", key: "fecha", width: 14 },
    { header: "Año", key: "anio", width: 8 },
    { header: "Mes", key: "mes", width: 12 },
    { header: "Monto", key: "monto", width: 14 },
    { header: "Descripción", key: "descripcion", width: 30 },
  ];

  payments.forEach((payment) => {
    worksheet.addRow({
      fecha: new Date(payment.paymentDate).toLocaleDateString("es-CL"),
      anio: payment.year,
      mes: MONTH_NAMES[payment.month - 1],
      monto: payment.amount,
      descripcion: payment.description || "",
    });
  });

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  addTotalRow(worksheet, totalAmount);

  await downloadWorkbook(workbook, fileName);
}

// Exporta el historial de pagos de TODOS los usuarios a Excel (vista admin)
export async function exportAllPaymentsToExcel(
  payments: MonthlyPayment[],
  fileName: string,
) {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Pagos");

  worksheet.columns = [
    { header: "Usuario", key: "usuario", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "RUT", key: "rut", width: 14 },
    { header: "Fecha de Pago", key: "fecha", width: 14 },
    { header: "Año", key: "anio", width: 8 },
    { header: "Mes", key: "mes", width: 12 },
    { header: "Monto", key: "monto", width: 14 },
    { header: "Descripción", key: "descripcion", width: 30 },
  ];

  payments.forEach((payment) => {
    worksheet.addRow({
      usuario: payment.user?.name || "",
      email: payment.user?.email || "",
      rut: payment.user?.rut || "",
      fecha: new Date(payment.paymentDate).toLocaleDateString("es-CL"),
      anio: payment.year,
      mes: MONTH_NAMES[payment.month - 1],
      monto: payment.amount,
      descripcion: payment.description || "",
    });
  });

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  addTotalRow(worksheet, totalAmount);

  await downloadWorkbook(workbook, fileName);
}
