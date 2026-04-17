import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  totalAmount: number;
  gstAmount: number;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Header
  page.drawText("GYMQR CONNECT", {
    x: 50,
    y: height - 50,
    size: 24,
    font: fontBold,
    color: rgb(0.639, 0.984, 0.18), // neon-lime #a3fb2e
  });

  page.drawText("TAX INVOICE", {
    x: width - 150,
    y: height - 50,
    size: 16,
    font: fontBold,
  });

  // Business Info
  const businessInfo = [
    "GymQR Connect Solutions Pvt Ltd",
    "123 Fitness Plaza, HSR Layout",
    "Bangalore, Karnataka - 560102",
    "GSTIN: 29ABCDE1234F1Z5",
    "Email: support@gymqr.connect"
  ];

  let currentY = height - 100;
  businessInfo.forEach(line => {
    page.drawText(line, {
      x: 50,
      y: currentY,
      size: 10,
      font: fontRegular,
    });
    currentY -= 15;
  });

  // Invoice Details
  page.drawText(`Invoice No: ${data.invoiceNumber}`, { x: width - 200, y: height - 100, size: 10, font: fontBold });
  page.drawText(`Date: ${data.date}`, { x: width - 200, y: height - 115, size: 10, font: fontRegular });

  // Customer Info
  currentY = height - 200;
  page.drawText("BILL TO:", { x: 50, y: currentY, size: 10, font: fontBold });
  currentY -= 15;
  page.drawText(data.customerName, { x: 50, y: currentY, size: 10, font: fontRegular });
  currentY -= 15;
  page.drawText(data.customerEmail, { x: 50, y: currentY, size: 10, font: fontRegular });

  // Table Header
  currentY -= 50;
  page.drawRectangle({
    x: 50,
    y: currentY - 5,
    width: width - 100,
    height: 25,
    color: rgb(0.1, 0.1, 0.1),
  });

  const tableHeaderY = currentY;
  page.drawText("Description", { x: 60, y: tableHeaderY, size: 10, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Qty", { x: 300, y: tableHeaderY, size: 10, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Price", { x: 400, y: tableHeaderY, size: 10, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Amount", { x: 500, y: tableHeaderY, size: 10, font: fontBold, color: rgb(1, 1, 1) });

  // Table Items
  currentY -= 30;
  data.items.forEach(item => {
    page.drawText(item.description, { x: 60, y: currentY, size: 10, font: fontRegular });
    page.drawText(item.quantity.toString(), { x: 300, y: currentY, size: 10, font: fontRegular });
    page.drawText(`₹${item.unitPrice.toFixed(2)}`, { x: 400, y: currentY, size: 10, font: fontRegular });
    page.drawText(`₹${item.amount.toFixed(2)}`, { x: 500, y: currentY, size: 10, font: fontRegular });
    currentY -= 20;
  });

  // Totals
  currentY -= 20;
  const totalX = 400;
  page.drawLine({
    start: { x: 350, y: currentY + 10 },
    end: { x: width - 50, y: currentY + 10 },
    thickness: 1,
  });

  page.drawText("Subtotal:", { x: totalX, y: currentY, size: 10, font: fontRegular });
  page.drawText(`₹${(data.totalAmount - data.gstAmount).toFixed(2)}`, { x: 500, y: currentY, size: 10, font: fontRegular });
  
  currentY -= 15;
  page.drawText("GST (18%):", { x: totalX, y: currentY, size: 10, font: fontRegular });
  page.drawText(`₹${data.gstAmount.toFixed(2)}`, { x: 500, y: currentY, size: 10, font: fontRegular });
  
  currentY -= 20;
  page.drawRectangle({
    x: 350,
    y: currentY - 5,
    width: width - 400,
    height: 25,
    color: rgb(0.9, 0.9, 0.9),
  });
  page.drawText("Total:", { x: totalX, y: currentY, size: 12, font: fontBold });
  page.drawText(`₹${data.totalAmount.toFixed(2)}`, { x: 500, y: currentY, size: 12, font: fontBold });

  // Footer
  page.drawText("This is a computer generated invoice and does not require a signature.", {
    x: 50,
    y: 50,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}
