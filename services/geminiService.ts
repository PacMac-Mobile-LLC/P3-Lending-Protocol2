import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, LoanRequest, LoanOffer, MatchResult, RiskReport } from "../types";

// Helper to safely get the API Key without crashing the app on load
const getAI = () => {
  // According to guidelines, we must exclusively use process.env.API_KEY.
  // We assume it is pre-configured and accessible.
  // We provide a fallback to avoid crash during initialization if key is missing,
  // letting the API call fail gracefully with a specific error if needed.
  const apiKey = process.env.API_KEY;
  return new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });
};

// AI Compliance Officer: Simulates regulatory checks (OFAC, PEP, Identity Verification)
export const performComplianceCheck = async (
  data: { name: string; dob: string; address: string; ssnLast4: string; docType?: string }
): Promise<{ passed: boolean; riskLevel: string; reasoning: string }> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
      
      NOTE: This is a simulation. Unless the name is "Osama bin Laden" or clearly fraudulent, assume the user is a standard citizen but provide professional reasoning.
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
    // Default to passing in dev/demo mode if API fails, but flag as manual review
    return { passed: true, riskLevel: 'Manual Review', reasoning: 'Automated check service unavailable. Provisional approval.' };
  }
};

// AI Underwriter: Analyzes profile text AND quantitative metrics
export const analyzeReputation = async (profile: UserProfile): Promise<{ score: number; analysis: string; newBadges: string[] }> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
    return { score: 50, analysis: "AI analysis unavailable.", newBadges: [] };
  }
};

// AI Matchmaker: Finds the best loan offers for a request
export const matchLoanOffers = async (request: LoanRequest, offers: LoanOffer[]): Promise<MatchResult[]> => {
  if (offers.length === 0) return [];

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a P3 Lending Matchmaker. Evaluate these loan offers against the borrower's request.
      
      Borrower Request:
      Amount: $${request.amount}
      Purpose: ${request.purpose}
      Reputation Score: ${request.reputationScoreSnapshot}
      Is Charity Guaranteed: ${request.isCharityGuaranteed} (If TRUE, risk is mitigated by platform insurance)
      Max Interest: ${request.maxInterestRate}%

      Available Offers:
      ${JSON.stringify(offers)}

      MATCHING LOGIC:
      1. If 'Is Charity Guaranteed' is TRUE, treat the borrower as if they have a Reputation Score of 80 (High Trust), because the funds are insured.
      2. Otherwise, enforce the lender's 'minReputationScore'.

      Return a list of matches. Rank them by 'matchScore' (0-100).
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

// NEW: Real-time Risk Engine with Search Grounding
export const analyzeRiskProfile = async (profile: UserProfile): Promise<RiskReport> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
      Return a JSON object with:
      - compositeScore (0-100)
      - macroScore (0-100 based on news)
      - walletScore (0-100 based on history)
      - factors: Array of { category, severity, description, sourceUrl }
      - summary: Brief narrative.
      `,
      config: {
        tools: [{ googleSearch: {} }], // ENABLE GOOGLE SEARCH GROUNDING
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    
    if (!text) throw new Error("No response from AI Risk Engine");
    
    // Sometimes search results add markdown or extra text, ensure we extract the JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    
    const report = JSON.parse(cleanJson) as RiskReport;
    report.timestamp = new Date().toISOString();
    return report;

  } catch (error) {
    console.error("Risk Analysis Error:", error);
    // Fallback if search fails
    return {
      compositeScore: 50,
      macroScore: 50,
      walletScore: 50,
      factors: [{ category: 'MACRO', severity: 'MEDIUM', description: 'Real-time market data unavailable.' }],
      summary: "Risk assessment running in offline mode due to connection error.",
      timestamp: new Date().toISOString()
    };
  }
};