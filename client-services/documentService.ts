
import { jsPDF } from 'jspdf';
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
    doc.text(`-$${credits.toFixed(2)}`, 75, yPos + 16);
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
  },

  generatePitchDeck: () => {
    // Landscape Mode
    const doc = new jsPDF('l', 'mm', 'a4');
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    const bg = '#050505';
    const accent = '#00e599';
    const textLight = '#e4e4e7';
    const textDim = '#a1a1aa';
    const secondaryColor = '#18181b'; // Defined for usage in charts where needed

    // Helper: Add Background
    const addSlideBg = () => {
      doc.setFillColor(bg);
      doc.rect(0, 0, width, height, 'F');
      // Top accent bar
      doc.setFillColor(accent);
      doc.rect(0, 0, width, 2, 'F');
      // Footer page number
      doc.setTextColor(textDim);
      doc.setFontSize(8);
      doc.text(`P3 SECURITIES | CONFIDENTIAL`, 10, height - 5);
    };

    // --- SLIDE 1: TITLE ---
    addSlideBg();
    
    doc.setTextColor(textLight);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(48);
    doc.text("P3 SECURITIES", width/2, height/2 - 10, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(accent);
    doc.text("Credit based on Character, not History.", width/2, height/2 + 5, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(textDim);
    doc.text("Seed Round Investor Deck | Q1 2025", width/2, height/2 + 20, { align: 'center' });

    // --- SLIDE 2: THE PROBLEM ---
    doc.addPage();
    addSlideBg();
    
    doc.setFontSize(24);
    doc.setTextColor(accent);
    doc.text("THE PROBLEM", 20, 25);
    
    doc.setFontSize(32);
    doc.setTextColor(textLight);
    doc.text("FICO is Broken.", 20, 40);
    
    doc.setFontSize(14);
    doc.setTextColor(textDim);
    const problemText = [
      "• 45 Million 'Credit Invisible' Americans cannot get loans.",
      "• Traditional banks rely on backward-looking data (7 years history).",
      "• Young people and Crypto-Natives have assets but no FICO score.",
      "• Black Box Algorithms discriminate without context."
    ];
    doc.text(problemText, 20, 60, { lineHeightFactor: 2 });

    // Graphic: Big Red "Denied"
    doc.setDrawColor(200, 50, 50);
    doc.setLineWidth(2);
    doc.roundedRect(150, 50, 100, 60, 5, 5, 'S');
    doc.setTextColor(200, 50, 50);
    doc.setFontSize(40);
    doc.text("DENIED", 200, 85, { align: 'center' });
    doc.setFontSize(12);
    doc.text("Reason: Insufficient History", 200, 95, { align: 'center' });

    // --- SLIDE 3: THE SOLUTION ---
    doc.addPage();
    addSlideBg();

    doc.setFontSize(24);
    doc.setTextColor(accent);
    doc.text("THE SOLUTION", 20, 25);

    doc.setFontSize(32);
    doc.setTextColor(textLight);
    doc.text("Social Underwriting.", 20, 40);

    doc.setFontSize(14);
    doc.setTextColor(textDim);
    const solutionText = [
      "P3 reintroduces the 'village' to finance using AI.",
      "",
      "1. Behavioral Scoring: We track repayment streaks and consistency.",
      "2. Contextual AI: Gemini analyzes the 'why' behind a user's story.",
      "3. Fresh Start Protocol: Charity-backed insurance for first-time borrowers.",
      "4. Trustless Escrow: Smart contracts handle the money, eliminating middlemen."
    ];
    doc.text(solutionText, 20, 60);

    // --- SLIDE 4: MARKET SIZE ---
    doc.addPage();
    addSlideBg();

    doc.setFontSize(24);
    doc.setTextColor(accent);
    doc.text("MARKET OPPORTUNITY", 20, 25);

    // Simple Bar Chart Construction
    const startX = 40;
    const startY = 130;
    
    // Bar 1: DeFi
    doc.setFillColor(50, 50, 50);
    doc.rect(startX, startY - 20, 40, 20, 'F');
    doc.setTextColor(textLight);
    doc.setFontSize(12);
    doc.text("DeFi TVL", startX + 20, startY + 10, { align: 'center' });
    doc.text("$15B", startX + 20, startY - 25, { align: 'center' });

    // Bar 2: P3 TAM
    doc.setFillColor(accent);
    doc.rect(startX + 60, startY - 80, 40, 80, 'F');
    doc.setTextColor(textLight); // Using textLight for visibility on dark background
    doc.text("P3 TAM", startX + 80, startY + 10, { align: 'center' });
    doc.text("$850B", startX + 80, startY - 85, { align: 'center' });
    
    doc.setTextColor(textDim);
    doc.text("(Unsecured Consumer Credit)", startX + 80, startY + 20, { align: 'center' });

    // Bar 3: TradFi
    doc.setFillColor(80, 80, 80);
    doc.rect(startX + 120, startY - 100, 40, 100, 'F'); // Cut off for scale visualization
    doc.setTextColor(textLight);
    doc.text("Trad Banks", startX + 140, startY + 10, { align: 'center' });
    doc.text("$4T+", startX + 140, startY - 105, { align: 'center' });

    // --- SLIDE 5: BUSINESS MODEL ---
    doc.addPage();
    addSlideBg();

    doc.setFontSize(24);
    doc.setTextColor(accent);
    doc.text("BUSINESS MODEL", 20, 25);

    // Box 1
    doc.setDrawColor(accent);
    doc.roundedRect(20, 50, 80, 50, 3, 3, 'S');
    doc.setFontSize(16);
    doc.setTextColor(textLight);
    doc.text("2.0% Origination Fee", 60, 70, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(textDim);
    doc.text("Charged on successful repayment.", 60, 80, { align: 'center' });

    // Box 2
    doc.setDrawColor(255, 255, 255);
    doc.roundedRect(110, 50, 80, 50, 3, 3, 'S');
    doc.setFontSize(16);
    doc.setTextColor(textLight);
    doc.text("B2B API Licensing", 150, 70, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(textDim);
    doc.text("Selling Risk Score API to other Dapps.", 150, 80, { align: 'center' });

    // Box 3
    doc.setDrawColor(255, 255, 255);
    doc.roundedRect(200, 50, 80, 50, 3, 3, 'S');
    doc.setFontSize(16);
    doc.setTextColor(textLight);
    doc.text("Spread on Yield", 240, 70, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(textDim);
    doc.text("0.5% Mgmt Fee on Mentor Pools.", 240, 80, { align: 'center' });

    // --- SLIDE 6: THE ASK ---
    doc.addPage();
    addSlideBg();

    doc.setFontSize(24);
    doc.setTextColor(accent);
    doc.text("THE ASK", 20, 25);

    doc.setFontSize(60);
    doc.setTextColor(textLight);
    doc.text("$1.5M Seed", width/2, height/2 - 10, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(textDim);
    doc.text("Use of Funds:", width/2, height/2 + 10, { align: 'center' });
    doc.text("40% Engineering (Mobile App)", width/2, height/2 + 20, { align: 'center' });
    doc.text("30% Legal & Compliance (Bank Charter)", width/2, height/2 + 28, { align: 'center' });
    doc.text("30% Liquidity Bootstrap", width/2, height/2 + 36, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(accent);
    doc.text("founders@p3lending.space", width/2, height - 20, { align: 'center' });

    doc.save('P3_Investor_Pitch_Deck.pdf');
  }
};
