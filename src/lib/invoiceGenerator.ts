import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

// Load image using promise
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const generateInvoice = async (order: any) => {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 40;

  // Brand Colors
  const olive = "#516117";
  const oliveLight = "#A4A841";
  const highlightRow = "#E6EFBF";
  const darkText = "#2f2f2f";

  // ------------------------------------------
  // 1️⃣ LOAD LOGO
  // ------------------------------------------
  const logo = await loadImage("/LOGO.png");

  // ------------------------------------------
  // 2️⃣ ADD WATERMARK
  // ------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(90);
  doc.text("BUMBA’S", pageWidth / 2, pageHeight / 2 - 50, {
    align: "center",
    opacity: 0.08,
  });
  doc.text("KITCHEN", pageWidth / 2, pageHeight / 2 + 40, {
    align: "center",
    opacity: 0.08,
  });

  // ------------------------------------------
  // 3️⃣ HEADER BAR (Premium Gradient)
  // ------------------------------------------
  doc.setFillColor(oliveLight);
  doc.rect(0, 0, pageWidth, 55, "F");

  doc.setFillColor("#C9CF58");
  doc.roundedRect(pageWidth - 200, 12, 180, 28, 6, 6, "F");

  doc.setFontSize(12);
  doc.setTextColor(olive);
  doc.text("ORIGINAL FOR RECIPIENT", pageWidth - 110, 30, {
    align: "center",
  });

  // ------------------------------------------
  // 4️⃣ LOGO + Title Block
  // ------------------------------------------
  doc.addImage(logo, "PNG", margin, 70, 95, 95);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(olive);
  doc.text("BUMBA’S KITCHEN", margin + 120, 110);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text("Mobile: 82406 90254", margin + 120, 135);

  // Receipt info
  doc.setFontSize(13);
  doc.setTextColor(olive);
  doc.setFont("helvetica", "bold");
  doc.text(`Receipt No : ${order.OrderNumber}`, pageWidth - margin, 110, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.text(
    `Date : ${new Date(order.Timestamp).toLocaleDateString("en-GB")}`,
    pageWidth - margin,
    135,
    { align: "right" }
  );

  // Divider
  doc.setDrawColor(olive);
  doc.setLineWidth(1.2);
  doc.line(margin, 170, pageWidth - margin, 170);

  // ------------------------------------------
  // 5️⃣ BILL TO → Premium Card
  // ------------------------------------------
  let y = 200;

  doc.setFillColor("#fefefe");
  doc.roundedRect(margin, y - 10, pageWidth - margin * 2, 90, 8, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(olive);
  doc.setFontSize(15);
  doc.text("Bill To", margin + 10, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(darkText);

  y += 30;
  doc.text(`Name: ${order.Name}`, margin + 20, y);

  y += 18;
  const addr = order.DeliveryAddress || order.Address || "N/A";
  const lines = doc.splitTextToSize(addr, 400);
  doc.text("Address:", margin + 20, y);
  doc.text(lines, margin + 90, y);

  y += 22 + (lines.length - 1) * 14;

  // ------------------------------------------
  // 6️⃣ TABLE – Ultra Premium
  // ------------------------------------------
  const tableData = order.Items.map((item: any, i: number) => [
    i + 1,
    doc.splitTextToSize(item.name, 260),
    item.quantity,
    item.price.toFixed(2),
    (item.quantity * item.price).toFixed(2),
  ]);

  autoTable(doc, {
    startY: y + 10,
    head: [["SL", "Description", "Qty", "Price", "Amount"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: olive,
      textColor: "#fff",
      fontSize: 12,
      halign: "center",
    },
    styles: {
      fontSize: 12,
      textColor: darkText,
      cellPadding: 6,
      lineColor: "#cccccc",
      lineWidth: 0.4,
    },
    alternateRowStyles: {
      fillColor: highlightRow,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 40 },
      1: { cellWidth: 260 },
      2: { halign: "center", cellWidth: 60 },
      3: { halign: "right", cellWidth: 80 },
      4: { halign: "right", cellWidth: 90 },
    },
  });

  const tableY = (doc as any).lastAutoTable.finalY + 30;

  // ------------------------------------------
  // 7️⃣ PAYMENT BADGE
  // ------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor("#fff");

  const isPaid = order.OrderType === "Prepaid";

  doc.setFillColor(isPaid ? "#2ecc71" : "#e74c3c");
  doc.roundedRect(pageWidth - 160, tableY - 50, 120, 35, 8, 8, "F");

  doc.text(isPaid ? "PAID" : "UNPAID", pageWidth - 100, tableY - 26, {
    align: "center",
  });

  // ------------------------------------------
  // 8️⃣ SUMMARY BOX – Premium Card
  // ------------------------------------------
  const summaryX = pageWidth - 260;
  let sy = tableY;

  doc.setFillColor("#ffffff");
  doc.setDrawColor(oliveLight);
  doc.setLineWidth(2);
  doc.roundedRect(summaryX, sy, 220, 140, 10, 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(olive);

  const summaryFields = [
    ["Sub Total", order.Subtotal],
    ["Discount", order.Discount],
    ["Received", order.ReceivedAmount],
  ];

  sy += 30;
  summaryFields.forEach(([label, value]) => {
    doc.text(label as string, summaryX + 15, sy);
    doc.text(`${value.toFixed(2)}`, summaryX + 205, sy, { align: "right" });
    sy += 22;
  });

  // Grand Total (highlight)
  doc.setFillColor(olive);
  doc.roundedRect(summaryX, sy, 220, 38, 10, 10, "F");

  doc.setTextColor("#fff");
  doc.setFontSize(16);
  doc.text("Grand Total", summaryX + 15, sy + 26);
  doc.text(order.FinalPrice.toFixed(2), summaryX + 205, sy + 26, {
    align: "right",
  });

  // ------------------------------------------
  // 9️⃣ QR CODE
  // ------------------------------------------
  const qrData = `${order.OrderNumber}|${order.Timestamp}|${order.Name}`;

  const qrBase64 = await QRCode.toDataURL(qrData);

  doc.addImage(qrBase64, "PNG", margin, sy - 10, 120, 120);

  // ------------------------------------------
  // 🔟 SIGNATURE LINE
  // ------------------------------------------
  const footerY = pageHeight - 120;

  doc.setDrawColor("#444");
  doc.line(pageWidth - 200, footerY + 20, pageWidth - 50, footerY + 20);

  doc.setFontSize(12);
  doc.text("Authorized Signatory", pageWidth - 125, footerY + 35, {
    align: "center",
  });

  // ------------------------------------------
  // 1️⃣1️⃣ FOOTER WITH ICONS
  // ------------------------------------------
  doc.setFont("helvetica", "italic");
  doc.setFontSize(20);
  doc.setTextColor("#000");
  doc.text("Thank You & Order Again ❤️", margin, pageHeight - 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text("Healthy Food Restaurant", margin, pageHeight - 30);

  doc.save(`Invoice_${order.OrderNumber}.pdf`);
};
