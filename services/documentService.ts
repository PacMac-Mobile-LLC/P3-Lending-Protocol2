
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserProfile } from '../types';

export const DocumentService = {
  generateStatement: (user: UserProfile) => {
    const doc = new jsPDF();
    const primaryColor = '#00e599'; // Neon Green
    const secondaryColor = '#18181b'; // Zinc 900
    
    // --- 1. HEADER / LETTERHEAD ---
    
    // Black Banner Top
    doc.setFillColor(secondaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    // Logo Construction (Vector P3 Logo)
    // Box
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 10, 12, 12, 2, 2, 'S');
    
    // 'P'
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("P", 17.5, 19);

    // '3' Badge
    doc.setFillColor(primaryColor);
    doc.circle(27, 10, 3, 'F');
    doc.setTextColor(secondaryColor);
    doc.setFontSize(8);
    doc.text("3", 26, 11);

    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("P3 SECURITIES", 35, 18);
    
    doc.setFontSize(8);
    doc.setTextColor(primaryColor);
    doc.text("AI-POWERED DECENTRALIZED LENDING", 35, 23);

    // Contact Info (Right Side)
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("1201 3rd Avenue", 195, 15, { align: "right" });
    doc.text("Seattle, WA 98101", 195, 19, { align: "right" });
    doc.text("support@p3lending.space", 195, 23, { align: "right" });

    // --- 2. STATEMENT DETAILS ---

    let yPos = 55;

    doc.setTextColor(secondaryColor);
    doc.setFontSize(16);
    doc.text("MONTHLY ACCOUNT STATEMENT", 15, yPos);
    
    yPos += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos, 195, yPos);

    yPos += 10;

    // Customer Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Account Holder:", 15, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(user.name, 50, yPos);

    doc.setFont("helvetica", "bold");
    doc.text("Account ID:", 120, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(user.id, 150, yPos);

    yPos += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Statement Date:", 15, yPos);
    doc.setFont("helvetica", "normal");
    doc.text("February 28, 2025", 50, yPos);

    doc.setFont("helvetica", "bold");
    doc.text("Current Tier:", 120, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(user.kycTier, 150, yPos);

    // --- 3. SUMMARY BOX ---
    yPos += 15;
    
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, yPos, 180, 25, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Beginning Balance", 25, yPos + 8);
    doc.text("Total Credits", 75, yPos + 8);
    doc.text("Total Debits", 125, yPos + 8);
    doc.text("Ending Balance", 175, yPos + 8, { align: "right" });

    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.setFont("helvetica", "bold");
    
    const startBal = user.balance * 0.9; // Mock start
    const credits = user.balance * 0.2;
    const debits = user.balance * 0.1;

    doc.text(`$${startBal.toFixed(2)}`, 25, yPos + 16);
    doc.setTextColor(0, 180, 0); // Green
    doc.text(`+$${credits.toFixed(2)}`, 75, yPos + 16);
    doc.setTextColor(200, 0, 0); // Red
    doc.text(`-$${debits.toFixed(2)}`, 125, yPos + 16);
    doc.setTextColor(secondaryColor);
    doc.text(`$${user.balance.toFixed(2)}`, 175, yPos + 16, { align: "right" });

    // --- 4. TRANSACTION TABLE ---
    
    const head = [['Date', 'Description', 'Type', 'Amount', 'Status']];
    const body = [
      ['Feb 28, 2025', 'Monthly Interest Payment', 'Yield', '+$45.20', 'COMPLETED'],
      ['Feb 25, 2025', 'Loan Repayment #8821', 'Debit', '-$250.00', 'COMPLETED'],
      ['Feb 14, 2025', 'Deposit via Coinbase', 'Credit', '+$1,000.00', 'COMPLETED'],
      ['Feb 10, 2025', 'Platform Fee', 'Fee', '-$5.00', 'COMPLETED'],
      ['Feb 01, 2025', 'Microloan Funding #9912', 'Debit', '-$50.00', 'COMPLETED'],
    ];

    autoTable(doc, {
      startY: yPos + 35,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { 
        fillColor: secondaryColor, 
        textColor: primaryColor,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        3: { fontStyle: 'bold', halign: 'right' }
      },
      didParseCell: function(data) {
        // Colorize Amount column
        if (data.section === 'body' && data.column.index === 3) {
            const text = data.cell.raw as string;
            if (text.startsWith('+')) {
                data.cell.styles.textColor = [0, 150, 0];
            } else {
                data.cell.styles.textColor = [200, 0, 0];
            }
        }
      }
    });

    // --- 5. FOOTER ---
    
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("P3 Securities LLC is a decentralized protocol interface. Loans are peer-to-peer and not FDIC insured.", 105, pageHeight - 15, { align: "center" });
    doc.text("Generated via P3 Dashboard v2.4.0", 105, pageHeight - 10, { align: "center" });

    // Download
    doc.save(`P3_Statement_${user.name.replace(/\s/g, '_')}_Feb2025.pdf`);
  }
};
