import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/voice-design
 *
 * Creates a custom voice preview using Qwen3-TTS VoiceDesign on fal.ai.
 * The `prompt` field is the voice description from our prompt assembler.
 */

const FAL_KEY = process.env.FAL_KEY;
const FAL_URL = "https://queue.fal.run/fal-ai/qwen-3-tts/text-to-speech/1.7b";

export async function POST(req: NextRequest) {
  if (!FAL_KEY) {
    return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { voice_prompt, preview_text } = body;

  if (!voice_prompt?.trim()) {
    return NextResponse.json({ error: "voice_prompt is required" }, { status: 400 });
  }

  try {
    // Call fal.ai Qwen3-TTS with voice description as prompt
    const res = await fetch(FAL_URL, {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: preview_text || "Hello, I am the voice you designed. Listen carefully to how I speak, the rhythm of my words, the texture of my tone.",
        prompt: voice_prompt,
        language: "English",
        temperature: 0.9,
        top_p: 1,
        repetition_penalty: 1.05,
        max_new_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("fal.ai error:", res.status, errText);
      return NextResponse.json({ error: `Voice design failed (${res.status})` }, { status: 502 });
    }

    const data = await res.json();

    // fal.ai returns audio URL
    const audioUrl = data.audio?.url;
    if (!audioUrl) {
      return NextResponse.json({ error: "No audio in response" }, { status: 500 });
    }

    // Fetch audio and convert to base64
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
      return NextResponse.json({ error: "Failed to fetch audio" }, { status: 502 });
    }

    const audioBuffer = await audioRes.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString("base64");

    return NextResponse.json({
      voice_id: `qwen3_${Date.now()}`,
      preview_audio: base64,
      duration_seconds: data.audio?.duration || 0,
      audio_url: audioUrl,
      description: voice_prompt,
    });
  } catch (e) {
    console.error("Voice design error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
