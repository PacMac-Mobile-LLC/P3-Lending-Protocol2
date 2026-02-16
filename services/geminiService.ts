
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, LoanRequest, LoanOffer, MatchResult, RiskReport } from "../types";
import { frontendEnv } from "./env";

// Helper to safely get the API Key without crashing the app on load
const getAI = () => {
  const apiKey = frontendEnv.VITE_API_KEY || '';

  // Explicit check for the string "undefined" which can happen during build replacement
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.warn("GeminiService: API Key is missing. Check your .env file and restart the server.");
    console.debug("Debug Info:", {
      viteEnv: frontendEnv.VITE_API_KEY ? "Present" : "Missing",
    });
    // Return null to indicate demo mode/unavailable
    return null;
  }

  return new GoogleGenAI({ apiKey: apiKey });
};

// AI Compliance Officer: Simulates regulatory checks (OFAC, PEP, Identity Verification)
export const performComplianceCheck = async (
  data: { name: string; dob: string; address: string; ssnLast4: string; docType?: string }
): Promise<{ passed: boolean; riskLevel: string; reasoning: string }> => {
  const ai = getAI();
  if (!ai) {
    return { passed: true, riskLevel: 'Manual Review', reasoning: 'Demo Mode: API Key missing. Provisional approval.' };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Act as a KYC/AML Compliance Officer for a Nebraska-based lending platform subject to the Bank Secrecy Act (BSA) and USA PATRIOT Act.
      
      Review the following applicant data for potential risks:
      Name: ${data.name}
      DOB: ${data.dob}
      Address: ${data.address}
      SSN (Last 4): ${data.ssnLast4}
      Document Provided: ${data.docType || 'None'}

      TASK:
      1. Simulate a screening against OFAC (Office of Foreign Assets Control) sanctions lists and PEP (Politically Exposed Persons) databases.
      2. Verify if the provided data format looks legitimate for a US resident.
      3. Assign a Risk Level (Low, Medium, High).
      4. Determine if KYC should pass or fail based on standard compliance protocols.
      
      IMPORTANT RULE:
      - If "Document Provided" is 'Public Records Match (eIDV)', this COUNTS as valid verification for Tier 1 (Basic) access. Do NOT reject due to lack of physical ID in this case.
      - Unless the name is "Osama bin Laden" or clearly fraudulent, assume the user is a standard citizen and APPROVE the application.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: { type: Type.BOOLEAN },
            riskLevel: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["passed", "riskLevel", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Compliance Check Error:", error);
    return { passed: true, riskLevel: 'Error', reasoning: 'Automated check failed. Provisional approval given for testing.' };
  }
};

// AI Underwriter: Analyzes profile text AND quantitative metrics
export const analyzeReputation = async (profile: UserProfile): Promise<{ score: number; analysis: string; newBadges: string[] }> => {
  const ai = getAI();
  if (!ai) {
    return { score: 50, analysis: "Demo Mode: AI analysis unavailable (Missing API Key).", newBadges: [] };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Analyze the financial reputation of this user for the P3 Lending Protocol with an emphasis on **Equal Opportunity**.
      
      User Metrics (On-Chain Trust):
      - Successful Repayments: ${profile.successfulRepayments}
      - Current Repayment Streak: ${profile.currentStreak}
      - Existing Badges: ${profile.badges.join(', ')}
      - KYC Tier: ${profile.kycTier}
      - Mentorships Funded: ${profile.mentorshipsCount || 0}
      
      Self-Reported Profile:
      - Name: ${profile.name}
      - Income: $${profile.income}/year
      - Employment: ${profile.employmentStatus}
      - History Narrative: "${profile.financialHistory}"

      SCORING RULES (Fairness Protocol):
      1. **Redemption Weighting**: If 'Current Repayment Streak' > 0, completely IGNORE any negative past history mentioned in the narrative. Actions on platform > Past social score.
      2. **Fresh Start**: If the user has 0 repayments but mentions "hardship" or "rebuilding", do not penalize below 40. Give them a "neutral" start.
      3. **Mentorship Bonus**: If "Mentorships Funded" > 0, boost score by 5-10 points.
      4. **Consistency**: Each successful repayment is a massive trust signal (+10 points).
      
      TASK:
      1. Assign a P3 Reputation Score (0-100).
      2. Provide a 1-sentence analysis. If they are rebuilding, use encouraging language like "Demonstrating positive redemption arc."
      3. Recommend new badges (e.g., "Redemption Hero", "Fresh Start", "Trusted Mentor").
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "The reputation score between 0 and 100" },
            analysis: { type: Type.STRING, description: "One sentence explanation of the score." },
            newBadges: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of new badges to award based on progress." }
          },
          required: ["score", "analysis", "newBadges"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Reputation Analysis Error:", error);
    return { score: 50, analysis: "AI Service Error. Please check logs.", newBadges: [] };
  }
};

// AI Advisor: Suggests Loan Terms for Lenders
export const suggestLoanTerms = async (targetScore: number): Promise<{ interestRate: number; maxAmount: number; reasoning: string }> => {
  const ai = getAI();
  if (!ai) {
    return { interestRate: 10, maxAmount: 500, reasoning: "Demo Mode: API Key missing. Defaulting to standard terms." };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Act as a DeFi Lending Advisor. A lender wants to create a loan offer for borrowers with a Reputation Score of ${targetScore} (Scale 0-100).
      
      Suggest optimal terms that balance risk and competitiveness.
      
      Rules of Thumb:
      - Score > 80: Low Risk. Rate 3-6%. High Amount.
      - Score 60-79: Medium Risk. Rate 7-12%. Medium Amount.
      - Score < 60: High Risk. Rate 13-20%. Low Amount (Microloans).
      
      Output JSON:
      {
        "interestRate": number (percentage, e.g. 5.5),
        "maxAmount": number (USD),
        "reasoning": string (short explanation)
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interestRate: { type: Type.NUMBER },
            maxAmount: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ["interestRate", "maxAmount", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    return { interestRate: 8, maxAmount: 1000, reasoning: "AI unavailable. Calculated market average." };
  }
};

// AI Matchmaker (Borrower View): Finds Offers for a Request
// STRICT "NO LUCK" LOGIC
export const matchLoanOffers = async (request: LoanRequest, offers: LoanOffer[]): Promise<MatchResult[]> => {
  if (offers.length === 0) return [];
  const ai = getAI();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Act as a P3 Lending Matchmaker (Deterministic Engine). 
      
      OBJECTIVE:
      Find the best loan offers for a borrower based STRICTLY on merit, reputation score compatibility, and financial efficiency.
      Do not introduce randomness. The matching must be explainable and logical. "No luck involved."

      Borrower Request:
      Amount: $${request.amount}
      Purpose: ${request.purpose}
      Reputation Score: ${request.reputationScoreSnapshot}
      Is Charity Guaranteed: ${request.isCharityGuaranteed} (If TRUE, risk is completely mitigated).
      Max Interest: ${request.maxInterestRate}%

      Available Offers:
      ${JSON.stringify(offers)}

      MATCHING LOGIC (STRICT):
      1. **Hard Filter (Amount):** Offer Max Amount must be >= Request Amount.
      2. **Hard Filter (Score):** If 'Is Charity Guaranteed' is FALSE, Borrower Reputation Score MUST be >= Lender's Min Reputation Score.
      3. **Hard Filter (Interest):** Offer Interest Rate must be <= Borrower's Max Interest Rate.
      4. **Ranking (Match Score):** 
         - Lower interest rates = Higher score.
         - Closer alignment on terms = Higher score.
         - If the offer is from a "Trusted Mentor" (implied context), boost score by 5%.

      OUTPUT:
      Return a list of matches. Rank them by 'matchScore' (0-100).
      The reasoning must explain exactly WHY the data fits (e.g., "Borrower score 85 exceeds Lender requirement of 80").
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              offerId: { type: Type.STRING },
              matchScore: { type: Type.INTEGER },
              reasoning: { type: Type.STRING }
            },
            required: ["offerId", "matchScore", "reasoning"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const matches = JSON.parse(text) as Omit<MatchResult, 'requestId'>[];
    return matches.map(m => ({ ...m, requestId: request.id }));

  } catch (error) {
    console.error("Matching Error:", error);
    return [];
  }
};

// AI Matchmaker (Lender View): Finds Requests for an Offer
// STRICT "NO LUCK" LOGIC
export const matchBorrowers = async (offer: LoanOffer, requests: LoanRequest[]): Promise<MatchResult[]> => {
  if (requests.length === 0) return [];
  const ai = getAI();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Act as a P3 Lending Matchmaker (Lender Side). Find qualified borrowers for this specific Loan Offer based purely on data (No Luck).
      
      Lender Offer Details:
      Max Amount: $${offer.maxAmount}
      Interest Rate: ${offer.interestRate}%
      Min Reputation Score Required: ${offer.minReputationScore}

      Available Borrower Requests:
      ${JSON.stringify(requests)}

      MATCHING LOGIC (STRICT):
      1. **Hard Filter (Amount):** Borrower Request Amount must be <= Lender Max Amount.
      2. **Hard Filter (Score):** Borrower Reputation Score must be >= Lender Min Score (unless 'isCharityGuaranteed' is true).
      3. **Merit Ranking:**
         - High Repayment Streak (>3) = +20 Match Score.
         - Verified Identity (Tier 2/3) = +15 Match Score.
         - "Fresh Start" guaranteed loans are safe = Treat as high match.
      
      OUTPUT:
      Return a list of matches. Rank them by 'matchScore' (0-100).
      The reasoning should highlight the borrower's MERIT (e.g., "User has a 5-month repayment streak").
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              requestId: { type: Type.STRING },
              matchScore: { type: Type.INTEGER },
              reasoning: { type: Type.STRING }
            },
            required: ["requestId", "matchScore", "reasoning"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    // Parse response and map back to MatchResult structure
    const matches = JSON.parse(text);
    return matches.map((m: any) => ({
      offerId: offer.id,
      requestId: m.requestId,
      matchScore: m.matchScore,
      reasoning: m.reasoning
    }));

  } catch (error) {
    console.error("Borrower Matching Error:", error);
    return [];
  }
};

// NEW: Real-time Risk Engine with Search Grounding
export const analyzeRiskProfile = async (profile: UserProfile): Promise<RiskReport> => {
  const ai = getAI();
  if (!ai) {
    return {
      compositeScore: 50,
      macroScore: 50,
      walletScore: 50,
      factors: [{ category: 'MACRO', severity: 'MEDIUM', description: 'Demo Mode: API Key missing.' }],
      summary: "Risk assessment unavailable in demo mode. Please configure API_KEY.",
      timestamp: new Date().toISOString()
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Conduct a comprehensive Risk Assessment for this user on the P3 Lending Protocol.
      
      USER ON-CHAIN DATA:
      - Wallet Age: ${profile.walletAgeDays || 30} days
      - Transaction Count: ${profile.txCount || 5} lifetime txs
      - Repayment History: ${profile.successfulRepayments} successful, Streak: ${profile.currentStreak}
      - KYC Status: ${profile.kycStatus}
      
      TASK:
      1. Use Google Search to find **current** crypto market conditions (volatility, recent major DeFi hacks, regulatory crackdowns in the US/EU).
      2. Combine this "Macro" data with the "User On-Chain" data to calculate a Composite Risk Score.
      
      SCORING (0 = Safe, 100 = Extremely Risky):
      - Low Wallet Age (< 90 days) increases risk significantly.
      - High Global Market Volatility increases risk slightly for everyone.
      - Verified KYC reduces risk significantly.

      OUTPUT FORMAT:
      You must strictly return a valid JSON object starting with { and ending with }.
      Do not include markdown code blocks.
      
      JSON Structure:
      {
        "compositeScore": number,
        "macroScore": number,
        "walletScore": number,
        "factors": [{ "category": "MACRO"|"ON-CHAIN", "severity": "LOW"|"MEDIUM"|"HIGH", "description": "string", "sourceUrl": "string (optional)" }],
        "summary": "string"
      }
      `,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text;

    if (!text) throw new Error("No response from AI Risk Engine");

    // Extract JSON from the text response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;

    const report = JSON.parse(cleanJson) as RiskReport;
    report.timestamp = new Date().toISOString();
    return report;

  } catch (error: any) {
    console.error("Risk Analysis Error:", error);
    const errorMessage = error.message || "Unknown error";
    return {
      compositeScore: 50,
      macroScore: 50,
      walletScore: 50,
      factors: [{ category: 'MACRO', severity: 'MEDIUM', description: `Risk assessment failed: ${errorMessage}` }],
      summary: `Risk assessment error: ${errorMessage}. Check console for details.`,
      timestamp: new Date().toISOString()
    };
  }
};
