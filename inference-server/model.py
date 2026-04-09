"""
Qwen3-TTS Voice Engine — using official qwen-tts package
"""

import io
import base64
import torch
import soundfile as sf

_model = None


def load_models():
    global _model
    if _model is not None:
        return

    from qwen_tts import Qwen3TTSModel

    print("[Qwen3-TTS] Loading VoiceDesign model...")
    _model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",
        device_map="cuda:0",
        dtype=torch.bfloat16,
    )
    print("[Qwen3-TTS] Model ready.")


def generate_voice_design(text: str, instruct: str, language: str = "English") -> dict:
    """
    Generate speech with a custom voice designed from description.

    Args:
        text: What to say
        instruct: Voice description + delivery instructions
        language: "English", "Chinese", etc.

    Returns dict with audio_base64, duration_seconds, sample_rate
    """
    if _model is None:
        load_models()

    wavs, sr = _model.generate_voice_design(
        text=text,
        language=language,
        instruct=instruct,
    )

    buf = io.BytesIO()
    sf.write(buf, wavs[0], sr, format="WAV")
    audio_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    duration = len(wavs[0]) / sr

    return {
        "audio_base64": audio_b64,
        "duration_seconds": round(duration, 2),
        "sample_rate": sr,
        "format": "wav",
    }
