"""
RunPod Serverless Handler — Qwen3-TTS Dual-Model Pipeline

Two actions:
  "design"   → Create a custom voice from description, get preview + voice_id
  "generate" → Generate dialogue with the cloned voice (consistent across lines)
"""

import runpod
from model import load_models, design_voice, generate_dialogue


def handler(job):
    job_input = job["input"]
    action = job_input.get("action", "design")

    if action == "design":
        instruct = job_input.get("description", "").strip()
        preview_text = job_input.get("text", "").strip()
        language = job_input.get("language", "English")

        if not instruct:
            return {"error": "description is required for voice design"}
        if not preview_text:
            preview_text = "Hello, I am the voice you designed. Listen to how I sound."

        try:
            return design_voice(
                instruct=instruct,
                preview_text=preview_text,
                language=language,
            )
        except Exception as e:
            return {"error": f"Voice design failed: {e}"}

    elif action == "generate":
        text = job_input.get("text", "").strip()
        voice_id = job_input.get("voice_id", "").strip()
        language = job_input.get("language", "English")

        if not text:
            return {"error": "text is required"}
        if not voice_id:
            return {"error": "voice_id is required — design a voice first"}

        try:
            return generate_dialogue(
                text=text,
                voice_id=voice_id,
                language=language,
            )
        except Exception as e:
            return {"error": f"Generation failed: {e}"}

    else:
        return {"error": f"Unknown action: {action}. Use 'design' or 'generate'."}


print("[RunPod] Loading Qwen3-TTS dual-model pipeline...")
load_models()
print("[RunPod] Ready.")

runpod.serverless.start({"handler": handler})
