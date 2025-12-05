import { GoogleGenAI, Type } from "@google/genai";
import { GenerationPlan, Scenario } from '../types';

// Helper to convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Phase 1: Analyze the uploaded image and generate a plan (prompts).
 * We use gemini-2.5-flash for fast reasoning and JSON output.
 */
export const analyzeAndPlanSession = async (
  imageBase64: string,
  count: number,
  genderPreference: string
): Promise<GenerationPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analyze the provided image of a person.
    1. Provide a concise but detailed physical description (face, hair, build, age estimate, ethnicity) to ensure identity consistency.
    2. Generate ${count} distinct, professional photography scenarios for this person.
    
    The goal is to create a portfolio of the SAME person in different contexts (Business, Casual, Sport, Evening, Travel, Artistic).
    Vary the outfits, locations, poses, and lighting significantly for each scenario.
    
    If gender preference is '${genderPreference}' (and not auto), ensure outfits match.
    
    Return JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          physicalDescription: { type: Type.STRING, description: "Detailed physical description of the person" },
          scenarios: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                outfit: { type: Type.STRING },
                location: { type: Type.STRING },
                lighting: { type: Type.STRING },
                pose: { type: Type.STRING },
                styleName: { type: Type.STRING, description: "Short title for this style (e.g. 'Business Suit')" }
              },
              required: ["outfit", "location", "lighting", "pose", "styleName"]
            }
          }
        },
        required: ["physicalDescription", "scenarios"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate plan");
  
  return JSON.parse(text) as GenerationPlan;
};

/**
 * Phase 2: Generate a single image based on the reference and the specific scenario.
 * We use gemini-2.5-flash-image for reliable access and multimodal generation.
 */
export const generateSingleImage = async (
  referenceImageBase64: string,
  scenario: Scenario,
  physicalDescription: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prompt Engineering for Identity Preservation
  // We instruct the model to keep the face/identity from the reference but change context.
  const prompt = `
    Photorealistic portrait.
    Reference image provided. KEEP THE FACIAL IDENTITY AND FEATURES EXACTLY THE SAME as the reference image.
    
    Change the context to:
    Outfit: ${scenario.outfit}
    Location: ${scenario.location}
    Lighting: ${scenario.lighting}
    Pose: ${scenario.pose}
    
    Subject description (for reinforcement): ${physicalDescription}.
    
    High quality, 4k, highly detailed, professional photography, masterpiece.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: referenceImageBase64 } }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4", // Portrait aspect ratio is best for people
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data returned in response");
  } catch (error) {
    console.error("Generation error:", error);
    throw error;
  }
};