import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getNutritionAdvice = async (history: { role: 'user' | 'model', text: string }[], userProfile: any) => {
  const systemInstruction = `You are the NutriSense AI Advisor, a world-class nutrition and wellness expert.
    User Profile: ${JSON.stringify(userProfile)}
    Help the user with meal planning, nutrition advice, habit building, and wellness tips. 
    Be supportive, scientific but approachable, and elite in your suggestions. 
    Keep responses concise and formatted for a chat interface. Use markdown where appropriate.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Advisor error:", error);
    return "I'm sorry, I'm having trouble connecting to my neural core. Please try again in a moment.";
  }
};
