import { GoogleGenAI } from "@google/genai";
import type { SafetyAnalysis } from "@shared/schema";

// Lazy initialize Gemini client after env is loaded
function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY environment variable.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function analyzeSafetyImage(imageBuffer: Buffer): Promise<SafetyAnalysis> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY environment variable.");
    }

    const systemPrompt = `You are a workplace safety AI specialist analyzing worker selfies for fitness for duty assessment. 

Your task is to evaluate whether a worker appears to be under the influence of alcohol or substances that would make them unsafe to work.

Analyze the image for the following safety indicators:
1. Eye Movement & Focus - Look for bloodshot eyes, unusual dilation, difficulty focusing, or glazed appearance
2. Facial Expression - Check for signs of confusion, disorientation, or altered mental state
3. Head Position - Assess stability, ability to hold head steady, signs of swaying or instability  
4. Skin Color Analysis - Look for flushing, pallor, or other color changes that might indicate impairment

Provide a comprehensive safety assessment with:
- Overall status: "passed" or "flagged" 
- Confidence score (0-100)
- Individual criteria scores and status
- List of any detected issues
- Risk level assessment
- Recommendations

Be thorough but fair in your assessment. Only flag cases where there are clear indicators of potential impairment that could affect workplace safety.

Respond with JSON in this exact format:
{
  "overallStatus": "passed" or "flagged",
  "confidence": number between 0-100,
  "criteria": {
    "eyeMovement": {"score": number, "status": "normal" or "abnormal"},
    "facialExpression": {"score": number, "status": "normal" or "abnormal"}, 
    "headPosition": {"score": number, "status": "stable" or "unstable"},
    "skinColor": {"score": number, "status": "normal" or "abnormal"}
  },
  "detectedIssues": ["list of specific issues found"],
  "riskLevel": "low", "medium", or "high",
  "recommendations": ["list of recommendations"]
}`;

    const contents = [
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      "Analyze this worker selfie for workplace safety compliance and fitness for duty assessment.",
    ];

    const response = await getAiClient().models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            overallStatus: { 
              type: "string",
              enum: ["passed", "flagged"]
            },
            confidence: { 
              type: "number",
              minimum: 0,
              maximum: 100
            },
            criteria: {
              type: "object",
              properties: {
                eyeMovement: {
                  type: "object",
                  properties: {
                    score: { type: "number" },
                    status: { type: "string", enum: ["normal", "abnormal"] }
                  },
                  required: ["score", "status"]
                },
                facialExpression: {
                  type: "object", 
                  properties: {
                    score: { type: "number" },
                    status: { type: "string", enum: ["normal", "abnormal"] }
                  },
                  required: ["score", "status"]
                },
                headPosition: {
                  type: "object",
                  properties: {
                    score: { type: "number" },
                    status: { type: "string", enum: ["stable", "unstable"] }
                  },
                  required: ["score", "status"]
                },
                skinColor: {
                  type: "object",
                  properties: {
                    score: { type: "number" },
                    status: { type: "string", enum: ["normal", "abnormal"] }
                  },
                  required: ["score", "status"]
                }
              },
              required: ["eyeMovement", "facialExpression", "headPosition", "skinColor"]
            },
            detectedIssues: {
              type: "array",
              items: { type: "string" }
            },
            riskLevel: {
              type: "string",
              enum: ["low", "medium", "high"]
            },
            recommendations: {
              type: "array", 
              items: { type: "string" }
            }
          },
          required: ["overallStatus", "confidence", "criteria", "detectedIssues", "riskLevel", "recommendations"]
        },
      },
      contents: contents,
    });

    const rawJson = response.text;

    if (!rawJson) {
      throw new Error("Empty response from Gemini AI model");
    }

    console.log(`Gemini AI Analysis Result: ${rawJson}`);

    try {
      const analysis: SafetyAnalysis = JSON.parse(rawJson);
      
      // Validate the response structure
      if (!analysis.overallStatus || !analysis.criteria || typeof analysis.confidence !== 'number') {
        throw new Error("Invalid response structure from Gemini AI");
      }

      // Ensure confidence is within valid range
      analysis.confidence = Math.max(0, Math.min(100, analysis.confidence));

      return analysis;
    } catch (parseError) {
      console.error("Failed to parse Gemini AI response:", parseError);
      throw new Error("Invalid JSON response from Gemini AI model");
    }

  } catch (error) {
    console.error("Gemini AI analysis failed:", error);
    
    if (error instanceof Error) {
      // Re-throw with more context for specific error types
      if (error.message.includes("API key")) {
        throw new Error("Gemini API key is invalid or not configured. Please check your API key configuration.");
      } else if (error.message.includes("quota")) {
        throw new Error("Gemini API quota exceeded. Please check your API usage limits.");
      } else if (error.message.includes("permission")) {
        throw new Error("Gemini API permission denied. Please verify your API key has the required permissions.");
      }
    }

    // Fallback error for any other issues
    throw new Error(`Workplace safety analysis failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

// Helper function to validate image format and size
export function validateImageForAnalysis(buffer: Buffer, mimeType?: string): boolean {
  // Check file size (max 10MB)
  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error("Image file too large. Maximum size is 10MB.");
  }

  // Check if it's a supported image format by looking at magic bytes
  const header = buffer.subarray(0, 4);
  const isJPEG = header[0] === 0xFF && header[1] === 0xD8;
  const isPNG = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
  const isWEBP = buffer.subarray(8, 12).toString() === 'WEBP';

  if (!isJPEG && !isPNG && !isWEBP) {
    throw new Error("Unsupported image format. Please use JPEG, PNG, or WebP images.");
  }

  return true;
}
