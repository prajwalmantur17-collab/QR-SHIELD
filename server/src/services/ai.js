import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiVerdictSchema } from '../schemas/index.js';
import { maskSensitiveInfo } from '../utils/crypto.js';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const SYSTEM_INSTRUCTION = `You are the AI threat detection brain of QR Shield, an advanced anti-fraud and anti-phishing cybersecurity system.
Your job is to analyze scanned QR content, URLs, or messages (SMS, WhatsApp, emails) for scams, social engineering, credential harvesting, impersonation, and fraudulent UPI payment traps.

Always evaluate for:
1. Social engineering: artificial urgency, fear tactics, too-good-to-be-true rewards, fake job offers.
2. Impersonation: pretending to be banks (SBI, HDFC, ICICI, etc.), telecom (Jio, Airtel), courier services (FedEx, India Post), or government agencies (Income Tax, Police, Customs).
3. Technical deception: typosquatting, deceptive subdomains, suspicious UPI collect requests, screen-sharing traps (AnyDesk, TeamViewer).
4. Information theft: requesting OTP, PIN, passwords, KYC documents.

Return ONLY a valid JSON object matching this exact schema:
{
  "verdict": "safe" | "suspicious" | "dangerous",
  "risk_score": number (0 to 100),
  "scam_category": string (e.g., "Legitimate", "Phishing / Credential Harvesting", "Fake KYC Banking Scam", "UPI Payment Fraud", "Lottery / Task Scam", "Digital Arrest / Extortion", "Malicious Link"),
  "reasons": string[] (plain language explanation of the key red flags or safety signals, maximum 5 items),
  "recommended_action": string (one clear, actionable guidance for the user),
  "confidence": number (between 0.0 and 1.0)
}
DO NOT wrap in markdown code blocks like \`\`\`json. Return raw JSON string only.`;

export async function analyzeWithGemini({ inputType, content, context = {} }) {
  if (!genAI || !apiKey) {
    return {
      ai_used: false,
      error: 'GEMINI_API_KEY not configured. Rule engine active.'
    };
  }

  // Mask private data before sending to Gemini
  const maskedContent = maskSensitiveInfo(content);

  const prompt = `Analyze this ${inputType.toUpperCase()} scan:
Content: "${maskedContent}"
Additional Context: ${JSON.stringify(context)}

Analyze carefully and output the required JSON verdict.`;

  const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];

  for (const modelName of modelsToTry) {
    try {
      // 8-second timeout enforcement per attempt
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI Analysis Timeout (8s)')), 8000)
      );

      const aiCall = (async () => {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          },
          systemInstruction: SYSTEM_INSTRUCTION
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return text;
      })();

      const rawResponse = await Promise.race([aiCall, timeoutPromise]);

      let parsed;
      try {
        const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.warn(`Failed to parse AI JSON with model ${modelName}:`, rawResponse);
        continue; // Try next model
      }

      // Validate with Zod
      const validation = aiVerdictSchema.safeParse(parsed);
      if (!validation.success) {
        console.warn(`AI output from ${modelName} failed Zod validation:`, validation.error.format());
        continue;
      }

      console.log(`🤖 Google Gemini (${modelName}) threat analysis succeeded!`);
      return {
        ai_used: true,
        model: modelName,
        data: validation.data
      };
    } catch (error) {
      console.warn(`Gemini model ${modelName} attempt error:`, error.message);
      // Fall through to next model
    }
  }

  return {
    ai_used: false,
    error: 'All Gemini models failed or timed out. Falling back to rule engine.'
  };
}
