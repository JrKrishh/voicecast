import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/tts
 *
 * Generates a dialogue line using Qwen3-TTS on fal.ai.
 * Uses the voice description (prompt) for consistent voice + emotion.
 */

const FAL_KEY = process.env.FAL_KEY;
const FAL_URL = "https://queue.fal.run/fal-ai/qwen-3-tts/text-to-speech/1.7b";

export async function POST(req: NextRequest) {
  if (!FAL_KEY) {
    return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { text, description } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (!description?.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  try {
    const res = await fetch(FAL_URL, {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        prompt: description,
        language: "English",
        temperature: 0.9,
        top_p: 1,
        repetition_penalty: 1.05,
        max_new_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `TTS failed (${res.status})` }, { status: 502 });
    }

    const data = await res.json();
    const audioUrl = data.audio?.url;

    if (!audioUrl) {
      return NextResponse.json({ error: "No audio in response" }, { status: 500 });
    }

    const audioRes = await fetch(audioUrl);
    const audioBuffer = await audioRes.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString("base64");

    return NextResponse.json({
      audio_base64: base64,
      duration_seconds: data.audio?.duration || 0,
      format: data.audio?.content_type === "audio/mpeg" ? "mp3" : "wav",
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
