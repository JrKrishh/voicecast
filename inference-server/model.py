"""
Qwen3-TTS Dual-Model Voice Engine

Pipeline:
1. VoiceDesign model → creates a unique voice from text description
2. Base model → clones that voice for consistent dialogue generation

This gives: custom voice creation + consistent voice across lines + emotion control
"""

import io
import base64
import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel

_design_model = None
_clone_model = None
_voice_cache = {}  # voice_id -> (clone_prompt, ref_text)


def load_models():
    global _design_model, _clone_model
    if _design_model is not None:
        return

    print("[Qwen3-TTS] Loading VoiceDesign model (1.7B)...")
    _design_model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",
        device_map="cuda:0",
        dtype=torch.bfloat16,
    )
    print("[Qwen3-TTS] VoiceDesign loaded.")

    print("[Qwen3-TTS] Loading Base model for cloning (1.7B)...")
    _clone_model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
        device_map="cuda:0",
        dtype=torch.bfloat16,
    )
    print("[Qwen3-TTS] Base model loaded.")
    print("[Qwen3-TTS] Both models ready.")


def design_voice(instruct: str, preview_text: str, language: str = "English") -> dict:
    """
    Step 1: Create a custom voice from description.
    Returns preview audio + a voice_id for use in dialogue generation.
    """
    if _design_model is None:
        load_models()

    # Generate reference audio with the designed voice
    wavs, sr = _design_model.generate_voice_design(
        text=preview_text,
        language=language,
        instruct=instruct,
    )

    ref_audio = wavs[0]
    voice_id = f"vc_{hash(instruct) & 0xFFFFFFFF:08x}"

    # Build a reusable clone prompt from this reference
    clone_prompt = _clone_model.create_voice_clone_prompt(
        ref_audio=(ref_audio, sr),
        ref_text=preview_text,
    )

    # Cache it for dialogue generation
    _voice_cache[voice_id] = clone_prompt

    # Encode preview audio as base64
    buf = io.BytesIO()
    sf.write(buf, ref_audio, sr, format="WAV")
    audio_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {
        "voice_id": voice_id,
        "audio_base64": audio_b64,
        "duration_seconds": round(len(ref_audio) / sr, 2),
        "sample_rate": sr,
        "format": "wav",
    }


def generate_dialogue(
    text: str,
    voice_id: str,
    language: str = "English",
) -> dict:
    """
    Step 2: Generate a dialogue line using the cloned voice.
    The voice_id must come from a previous design_voice call.
    Emotion is embedded in the text via the instruct field from the frontend.
    """
    if _clone_model is None:
        load_models()

    clone_prompt = _voice_cache.get(voice_id)
    if clone_prompt is None:
        return {"error": f"Voice '{voice_id}' not found. Design a voice first."}

    wavs, sr = _clone_model.generate_voice_clone(
        text=text,
        language=language,
        voice_clone_prompt=clone_prompt,
    )

    buf = io.BytesIO()
    sf.write(buf, wavs[0], sr, format="WAV")
    audio_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {
        "audio_base64": audio_b64,
        "duration_seconds": round(len(wavs[0]) / sr, 2),
        "sample_rate": sr,
        "format": "wav",
    }
