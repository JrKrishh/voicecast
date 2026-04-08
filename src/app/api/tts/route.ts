import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/tts
 *
 * Generates speech using a Qwen3-TTS custom voice.
 * Uses the non-streaming synthesis endpoint.
 */

const DASHSCOPE_URL = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

export async function POST(req: NextRequest) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DASHSCOPE_API_KEY not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { text, voice, instruct } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (!voice?.trim()) {
    return NextResponse.json({ error: "voice name is required" }, { status: 400 });
  }

  try {
    // Build messages for the TTS model
    const messages: any[] = [];

    // If instruct is provided, add it as a system-level voice instruction
    if (instruct?.trim()) {
      messages.push({
        role: "system",
        content: [{ text: instruct }],
      });
    }

    messages.push({
      role: "user",
      content: [{ text }],
    });

    const response = await fetch(DASHSCOPE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3-tts-vd-2026-01-26",
        input: { messages },
        parameters: {
          voice,
          response_format: "wav",
          sample_rate: 24000,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DashScope TTS error:", response.status, errText);
      return NextResponse.json(
        { error: `TTS failed (${response.status})`, details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // The response contains an audio URL
    const audioUrl = data.output?.audio?.url;
    if (!audioUrl) {
      // Try alternate response format — base64 audio
      const audioBase64 = data.output?.audio?.data;
      if (audioBase64) {
        return NextResponse.json({ audio_base64: audioBase64, format: "wav" });
      }
      return NextResponse.json({ error: "No audio in response", raw: data }, { status: 500 });
    }

    // Fetch the audio file and return as base64
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch audio file" }, { status: 502 });
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString("base64");

    return NextResponse.json({ audio_base64: base64, format: "wav" });
  } catch (e) {
    console.error("TTS error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
