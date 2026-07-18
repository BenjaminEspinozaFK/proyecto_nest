import jsPDF from "jspdf";
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

interface PayerInfo {
  name: string;
  rut: string;
  email: string;
  phone?: string;
}

function buildReceiptNumber(payment: MonthlyPayment): string {
  const period = `${payment.year}${String(payment.month).padStart(2, "0")}`;
  const shortId = payment.id.slice(-6).toUpperCase();
  return `REC-${period}-${shortId}`;
}

export function generatePaymentReceipt(
  payment: MonthlyPayment,
  payer: PayerInfo,
) {
  const doc = new jsPDF({ format: "a5" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const primaryColor: [number, number, number] = [16, 185, 129];
  const darkGray: [number, number, number] = [51, 51, 51];
  const lightGray: [number, number, number] = [245, 245, 245];

  const receiptNumber = buildReceiptNumber(payment);

  // Encabezado
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("COMPROBANTE DE PAGO", pageWidth / 2, 14, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`N° ${receiptNumber}`, pageWidth / 2, 22, { align: "center" });

  // Badge PAGADO
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth / 2 - 15, 25, 30, 8, 4, 4, "F");
  doc.setTextColor(...primaryColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("PAGADO", pageWidth / 2, 30.5, { align: "center" });

  let y = 44;

  // Fecha de emisión
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Emitido el ${new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    pageWidth / 2,
    y,
    { align: "center" },
  );

  y += 10;

  // Datos del pagador
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL PAGADOR", 12, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Nombre: ${payer.name}`, 12, y);
  y += 5;
  doc.text(`RUT: ${payer.rut}`, 12, y);
  y += 5;
  doc.text(`Email: ${payer.email}`, 12, y);
  y += 5;
  if (payer.phone) {
    doc.text(`Teléfono: ${payer.phone}`, 12, y);
    y += 5;
  }

  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.line(12, y, pageWidth - 12, y);
  y += 10;

  // Detalle del pago
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLE DEL PAGO", 12, y);
  y += 8;

  doc.setFillColor(...lightGray);
  doc.roundedRect(12, y - 5, pageWidth - 24, 12, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.text("Período", 16, y + 2.5);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${MONTH_NAMES[payment.month - 1]} ${payment.year}`,
    pageWidth - 16,
    y + 2.5,
    { align: "right" },
  );
  y += 15;

  doc.setFillColor(...lightGray);
  doc.roundedRect(12, y - 5, pageWidth - 24, 12, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkGray);
  doc.text("Fecha de pago", 16, y + 2.5);
  doc.setFont("helvetica", "bold");
  doc.text(
    new Date(payment.paymentDate).toLocaleDateString("es-ES"),
    pageWidth - 16,
    y + 2.5,
    { align: "right" },
  );
  y += 15;

  if (payment.description) {
    doc.setFillColor(...lightGray);
    doc.roundedRect(12, y - 5, pageWidth - 24, 12, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...darkGray);
    doc.text("Concepto", 16, y + 2.5);
    doc.setFont("helvetica", "bold");
    const description =
      payment.description.length > 35
        ? `${payment.description.slice(0, 35)}...`
        : payment.description;
    doc.text(description, pageWidth - 16, y + 2.5, { align: "right" });
    y += 15;
  }

  y += 5;

  // Monto total destacado
  doc.setFillColor(...primaryColor);
  doc.roundedRect(12, y, pageWidth - 24, 20, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("MONTO PAGADO", pageWidth / 2, y + 7, { align: "center" });
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`$${payment.amount.toLocaleString("es-CL")}`, pageWidth / 2, y + 15, {
    align: "center",
  });

  // Pie de página
  doc.setDrawColor(220, 220, 220);
  doc.line(12, pageHeight - 18, pageWidth - 12, pageHeight - 18);
  doc.setTextColor(140, 140, 140);
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Este comprobante certifica el pago registrado en el sistema.",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" },
  );
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}`,
    pageWidth / 2,
    pageHeight - 7,
    { align: "center" },
  );

  doc.save(`Comprobante_${receiptNumber}.pdf`);
}
