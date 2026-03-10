import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CartItem, CompanySettings } from "@/types/database";
import { toast } from "sonner";

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  financialYear: string;
  paymentMode: string;
  placeOfSupply: string;
  reverseCharge: boolean;
  referenceNumber?: string;
  deliveryNoteNumber?: string;
  transportName?: string;
  vehicleNumber?: string;
  lrNumber?: string;
  
  // Seller Details
  seller: CompanySettings;
  
  // Buyer Details
  customerName: string;
  billingAddress?: string;
  shippingAddress?: string;
  customerGstin?: string;
  customerState?: string;
  customerStateCode?: string;
  
  // Items
  cart: CartItem[];
  
  // Totals
  subtotal: number;
  taxableTotal: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  grandTotal: number;
  grandTotalWords: string;
}

export function generateInvoicePdf(data: InvoiceData, action: "save" | "print" = "save") {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", pageWidth / 2, 15, { align: "center" });
    
    doc.setFontSize(14);
    doc.text(data.seller.company_name, 14, 25);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(data.seller.address || "", 14, 30, { maxWidth: 80 });
    doc.text(`GSTIN: ${data.seller.gstin}`, 14, 42);
    doc.text(`State: ${data.seller.state} (${data.seller.state_code})`, 14, 46);
    doc.text(`Phone: ${data.seller.phone}`, 14, 50);

    // Right side header (Invoice details)
    doc.setFontSize(9);
    doc.text(`Invoice No: ${data.invoiceNumber}`, 120, 25);
    doc.text(`Date: ${data.invoiceDate}`, 120, 30);
    doc.text(`Financial Year: ${data.financialYear}`, 120, 35);
    doc.text(`Place of Supply: ${data.placeOfSupply}`, 120, 40);
    doc.text(`Payment Mode: ${data.paymentMode.toUpperCase()}`, 120, 45);
    if (data.transportName) doc.text(`Transport: ${data.transportName}`, 120, 50);
    if (data.vehicleNumber) doc.text(`Vehicle No: ${data.vehicleNumber}`, 120, 55);

    doc.setDrawColor(200);
    doc.line(14, 60, pageWidth - 14, 60);

    // 2. Buyer Details Section
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 14, 67);
    doc.setFont("helvetica", "normal");
    doc.text(data.customerName, 14, 72);
    doc.text(data.billingAddress || "", 14, 76, { maxWidth: 80 });
    doc.text(`GSTIN: ${data.customerGstin || "N/A"}`, 14, 87);
    doc.text(`State: ${data.customerState || "N/A"} (${data.customerStateCode || ""})`, 14, 91);

    doc.setFont("helvetica", "bold");
    doc.text("SHIP TO:", 110, 67);
    doc.setFont("helvetica", "normal");
    doc.text(data.customerName, 110, 72);
    doc.text(data.shippingAddress || data.billingAddress || "", 110, 76, { maxWidth: 80 });

    doc.line(14, 100, pageWidth - 14, 100);

    // 3. Items Table
    const formatCurrency = (num: number) => {
      return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const tableData = data.cart.map((item, i) => [
      i + 1,
      item.name,
      item.hsnCode || "",
      item.qty,
      item.unit || "PCS",
      formatCurrency(item.price),
      formatCurrency(item.discount),
      formatCurrency(item.taxableValue),
      `${item.gstRate}%`,
      formatCurrency(item.cgst + item.sgst + item.igst),
      formatCurrency(item.lineTotal)
    ]);

    autoTable(doc, {
      startY: 105,
      head: [["Sl", "Item Description", "HSN/SAC", "Qty", "Unit", "Rate", "Disc", "Taxable", "GST%", "GST Amt", "Total"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 65, 148], fontSize: 7.5, halign: "center", fontStyle: "bold" },
      bodyStyles: { fontSize: 7.5, font: "helvetica" },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        1: { cellWidth: 40 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "right", cellWidth: 10 },
        4: { halign: "center", cellWidth: 10 },
        5: { halign: "right", cellWidth: 15 },
        6: { halign: "right", cellWidth: 15 },
        7: { halign: "right", cellWidth: 18 },
        8: { halign: "center", cellWidth: 10 },
        9: { halign: "right", cellWidth: 18 },
        10: { halign: "right", cellWidth: 20 },
      },
    });

    // 4. Totals and Summary
    const finalY = (doc as any).lastAutoTable?.finalY || 120;
    
    // Tax Summary Table (Simplified)
    if (finalY < doc.internal.pageSize.height - 80) {
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.text("Tax Summary", 14, finalY + 10);
      
      const taxData = [];
      if (data.cgst > 0) taxData.push(["CGST Total", `Rs. ${formatCurrency(data.cgst)}`]);
      if (data.sgst > 0) taxData.push(["SGST Total", `Rs. ${formatCurrency(data.sgst)}`]);
      if (data.igst > 0) taxData.push(["IGST Total", `Rs. ${formatCurrency(data.igst)}`]);
      
      autoTable(doc, {
        startY: finalY + 12,
        body: taxData,
        theme: "plain",
        styles: { fontSize: 9.5, font: "helvetica" },
        columnStyles: { 0: { cellWidth: 35 }, 1: { halign: "right", cellWidth: 35 } },
        margin: { left: 14 }
      });
    }

    // Grand Totals on right
    doc.setFontSize(9);
    const rightX = 140;
    let y = finalY + 10;

    doc.setFont("helvetica", "normal");
    doc.text("Taxable Amount:", rightX, y);
    doc.text(`Rs. ${formatCurrency(data.taxableTotal)}`, pageWidth - 15, y, { align: "right" });
    y += 5;
    
    doc.text("Total GST:", rightX, y);
    doc.text(`Rs. ${formatCurrency(data.totalGst)}`, pageWidth - 15, y, { align: "right" });
    y += 5;
    
    doc.text("Round Off:", rightX, y);
    doc.text(`Rs. ${formatCurrency(data.roundOff)}`, pageWidth - 15, y, { align: "right" });
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Grand Total:", rightX, y);
    doc.text(`Rs. ${formatCurrency(data.grandTotal)}`, pageWidth - 15, y, { align: "right" });
    y += 7;

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(`Amount in Words: ${data.grandTotalWords}`, 14, y);

    // 5. Footer (Bank Details & Signature)
    y += 15;
    if (y > doc.internal.pageSize.height - 40) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("Bank Details:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(`Bank: ${data.seller.bank_name || "N/A"}`, 14, y + 6);
    doc.text(`A/c No: ${data.seller.account_no || "N/A"}`, 14, y + 11);
    doc.text(`IFSC: ${data.seller.ifsc_code || "N/A"}`, 14, y + 16);

    doc.setFont("helvetica", "bold");
    doc.text("Declaration:", 100, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("We declare that this invoice shows the actual price of the goods", 100, y + 6);
    doc.text("described and that all particulars are true and correct.", 100, y + 10);

    y += 30;
    doc.line(140, y, pageWidth - 14, y);
    doc.setFontSize(8);
    doc.text("Authorised Signatory", pageWidth - 40, y + 5, { align: "center" });

    if (action === "print") {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
      toast.success("Opening print dialog...");
    } else {
      doc.save(`${data.invoiceNumber}.pdf`);
      toast.success("GST Invoice generated successfully!");
    }
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    toast.error("Failed to generate PDF. Please try again.");
  }
}
