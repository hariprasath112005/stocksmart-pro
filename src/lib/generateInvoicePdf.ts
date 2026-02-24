import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CartItem } from "@/types/database";
import { toast } from "sonner";

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  cart: CartItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  paymentMethod: string;
  amountPaid: number;
  balance: number;
}

export function generateInvoicePdf(data: InvoiceData) {
  try {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Theecal Powersystems", 14, 22);
    
    doc.setFontSize(10);
    doc.text("& Marketing", 14, 28);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Tax Invoice", 14, 34);

    // Invoice details
    doc.setFontSize(10);
    doc.text(`Invoice: ${data.invoiceNumber}`, 140, 22);
    doc.text(`Date: ${data.date}`, 140, 28);
    doc.text(`Customer: ${data.customerName}`, 140, 34);
    doc.text(`Payment: ${data.paymentMethod.toUpperCase()}`, 140, 40);

    doc.setDrawColor(200);
    doc.line(14, 44, 196, 44);

    // Items table
    const tableData = data.cart.map((item, i) => {
      const price = Number(item.price);
      const qty = Number(item.qty);
      const discount = Number(item.discount);
      const gstRate = Number(item.gstRate);
      
      const lineTotal = price * qty - discount;
      const gstAmt = (lineTotal * gstRate) / 100;
      
      return [
        i + 1,
        item.name,
        item.code,
        qty,
        `₹${price.toFixed(2)}`,
        `₹${discount.toFixed(2)}`,
        `${gstRate}%`,
        `₹${gstAmt.toFixed(2)}`,
        `₹${(lineTotal + gstAmt).toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: 48,
      head: [["#", "Product", "Code", "Qty", "Price", "Disc", "GST%", "GST Amt", "Total"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 65, 148], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
      },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable?.finalY || 60;

    doc.setFontSize(10);
    const rightX = 150;
    let y = finalY + 10;

    doc.text("Subtotal:", rightX, y);
    doc.text(`₹${Number(data.subtotal).toFixed(2)}`, 185, y, { align: "right" });
    y += 6;

    doc.text("CGST:", rightX, y);
    doc.text(`₹${Number(data.cgst).toFixed(2)}`, 185, y, { align: "right" });
    y += 6;

    doc.text("SGST:", rightX, y);
    doc.text(`₹${Number(data.sgst).toFixed(2)}`, 185, y, { align: "right" });
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Grand Total:", rightX, y);
    doc.text(`₹${Number(data.grandTotal).toFixed(2)}`, 185, y, { align: "right" });
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Amount Paid: ₹${Number(data.amountPaid).toFixed(2)}`, rightX, y);
    y += 6;
    doc.text(`Balance: ₹${Number(data.balance).toFixed(2)}`, rightX, y);
    y += 12;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text("Thank you for your business!", 14, y);
    doc.text("This is a computer-generated invoice.", 14, y + 5);

    doc.save(`${data.invoiceNumber}.pdf`);
    toast.success("Invoice PDF generated successfully!");
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    toast.error("Failed to generate PDF. Please try again.");
  }
}
