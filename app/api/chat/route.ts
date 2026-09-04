import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface GenerationConfigInput {
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequence?: string;
  seed?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, generationConfig } = (await request.json()) as {
      messages: { role: string; content: string }[];
      generationConfig?: GenerationConfigInput;
    };

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Convert chat messages to Gemini format
    const contents = messages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })
    );

    const config = generationConfig
      ? {
          topK: generationConfig.topK,
          topP: generationConfig.topP,
          maxOutputTokens: generationConfig.maxOutputTokens,
          frequencyPenalty: generationConfig.frequencyPenalty,
          presencePenalty: generationConfig.presencePenalty,
          ...(generationConfig.stopSequence
            ? { stopSequences: [generationConfig.stopSequence] }
            : {}),
          ...(generationConfig.seed
            ? { seed: Number(generationConfig.seed) }
            : {}),
        }
      : undefined;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      ...(config ? { config } : {}),
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
