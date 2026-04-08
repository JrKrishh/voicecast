import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/voice-design
 *
 * Creates a custom voice using Qwen3-TTS Voice Design (DashScope API).
 * Takes a voice_prompt + preview_text, returns voice name + preview audio.
 */

const DASHSCOPE_URL = "https://dashscope-intl.aliyuncs.com/api/v1/services/audio/tts/customization";

export async function POST(req: NextRequest) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DASHSCOPE_API_KEY not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { voice_prompt, preview_text, preferred_name } = body;

  if (!voice_prompt?.trim()) {
    return NextResponse.json({ error: "voice_prompt is required" }, { status: 400 });
  }

  try {
    const response = await fetch(DASHSCOPE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen-voice-design",
        input: {
          action: "create",
          target_model: "qwen3-tts-vd-2026-01-26",
          voice_prompt: voice_prompt.slice(0, 2048),
          preview_text: (preview_text || "Hello, I am the voice you designed. Listen to how I sound.").slice(0, 1024),
          preferred_name: preferred_name || "voicecast",
          language: "en",
        },
        parameters: {
          sample_rate: 24000,
          response_format: "wav",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DashScope error:", response.status, errText);
      return NextResponse.json(
        { error: `Voice design failed (${response.status})`, details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract voice name and preview audio
    const voiceName = data.output?.voice;
    const previewAudioBase64 = data.output?.preview_audio?.data;

    if (!voiceName || !previewAudioBase64) {
      return NextResponse.json({ error: "Unexpected response format", raw: data }, { status: 500 });
    }

    return NextResponse.json({
      voice: voiceName,
      preview_audio: previewAudioBase64,
      target_model: data.output?.target_model,
    });
  } catch (e) {
    console.error("Voice design error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
