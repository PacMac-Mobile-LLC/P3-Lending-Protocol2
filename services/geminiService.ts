import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, LoanRequest, LoanOffer, MatchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// AI Compliance Officer: Simulates regulatory checks (OFAC, PEP, Identity Verification)
export const performComplianceCheck = async (
  data: { name: string; dob: string; address: string; ssnLast4: string; docType?: string }
): Promise<{ passed: boolean; riskLevel: string; reasoning: string }> => {
  try {
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the financial reputation of this user for the P3 Lending Protocol.
      
      User Metrics (On-Chain Trust):
      - Successful Repayments: ${profile.successfulRepayments}
      - Current Repayment Streak: ${profile.currentStreak}
      - Existing Badges: ${profile.badges.join(', ')}
      - KYC Tier: ${profile.kycTier}
      
      Self-Reported Profile:
      - Name: ${profile.name}
      - Income: $${profile.income}/year
      - Employment: ${profile.employmentStatus}
      - History Narrative: "${profile.financialHistory}"

      SCORING RULES:
      1. Base score starts low (20-40) for 0 repayments.
      2. Higher KYC Tiers (Tier 2/3) should provide a small trust boost (+5) as identity is verified.
      3. Each successful repayment boosts score significantly.
      
      TASK:
      1. Assign a P3 Reputation Score (0-100).
      2. Provide a 1-sentence risk analysis.
      3. Recommend new badges to award if milestones are met. Return empty array if no new badges.
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a P3 Lending Matchmaker. Evaluate these loan offers against the borrower's request.
      
      Borrower Request:
      Amount: $${request.amount}
      Purpose: ${request.purpose}
      Reputation Score: ${request.reputationScoreSnapshot}
      Max Interest: ${request.maxInterestRate}%

      Available Offers:
      ${JSON.stringify(offers)}

      Return a list of matches. Only include offers where the lender's minReputationScore <= borrower's score.
      Rank them by 'matchScore' (0-100) based on interest rate competitiveness and amount alignment.
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
