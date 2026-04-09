"""
RunPod Serverless Handler for Qwen3-TTS VoiceDesign.

Input:
  - text: dialogue text to synthesize
  - description: voice description (instruct prompt)
  - language: "English" (default), "Chinese", etc.

Output:
  - audio_base64: base64-encoded WAV
  - duration_seconds: float
  - sample_rate: int
"""

import runpod
from model import load_models, generate_voice_design


def handler(job):
    job_input = job["input"]

    text = job_input.get("text", "").strip()
    description = job_input.get("description", "").strip()
    language = job_input.get("language", "English")

    if not text:
        return {"error": "text is required"}
    if not description:
        return {"error": "description is required"}

    try:
        return generate_voice_design(
            text=text,
            instruct=description,
            language=language,
        )
    except Exception as e:
        return {"error": str(e)}


print("[RunPod] Loading Qwen3-TTS...")
load_models()
print("[RunPod] Ready.")

runpod.serverless.start({"handler": handler})
