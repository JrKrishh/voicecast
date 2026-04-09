"""
Maya1 Voice Engine — Model loader and inference
Creates custom voices from text descriptions with inline emotion tags.
"""

import torch
import numpy as np
from transformers import AutoModelForCausalLM, AutoTokenizer
from snac import SNAC

# Token IDs for Maya1
CODE_START_TOKEN_ID = 128257
CODE_END_TOKEN_ID = 128258
CODE_TOKEN_OFFSET = 128266
SNAC_MIN_ID = 128266
SNAC_MAX_ID = 156937
SNAC_TOKENS_PER_FRAME = 7
SOH_ID = 128259
EOH_ID = 128260
SOA_ID = 128261
BOS_ID = 128000
TEXT_EOT_ID = 128009

# Singleton model instances
_model = None
_tokenizer = None
_snac = None


def load_models():
    """Load Maya1 + SNAC decoder. Called once at startup."""
    global _model, _tokenizer, _snac

    if _model is not None:
        return

    print("[Maya1] Loading model...")
    _model = AutoModelForCausalLM.from_pretrained(
        "maya-research/maya1",
        torch_dtype=torch.bfloat16,
        device_map="auto",
        trust_remote_code=True,
    )
    _tokenizer = AutoTokenizer.from_pretrained(
        "maya-research/maya1",
        trust_remote_code=True,
    )
    print(f"[Maya1] Model loaded. Vocab size: {len(_tokenizer)}")

    print("[Maya1] Loading SNAC decoder...")
    _snac = SNAC.from_pretrained("hubertsiuzdak/snac_24khz").eval()
    if torch.cuda.is_available():
        _snac = _snac.to("cuda")
    print("[Maya1] SNAC decoder loaded.")


def build_prompt(description: str, text: str) -> str:
    """Build the Maya1 prompt with voice description and text."""
    soh = _tokenizer.decode([SOH_ID])
    eoh = _tokenizer.decode([EOH_ID])
    soa = _tokenizer.decode([SOA_ID])
    sos = _tokenizer.decode([CODE_START_TOKEN_ID])
    eot = _tokenizer.decode([TEXT_EOT_ID])
    bos = _tokenizer.bos_token

    formatted = f'<description="{description}"> {text}'
    return soh + bos + formatted + eot + eoh + soa + sos


def generate_speech(
    text: str,
    description: str,
    temperature: float = 0.4,
    top_p: float = 0.9,
    max_new_tokens: int = 2048,
) -> tuple[np.ndarray, int]:
    """
    Generate speech audio from text + voice description.

    Returns (audio_samples, sample_rate)
    """
    if _model is None:
        load_models()

    prompt = build_prompt(description, text)
    inputs = _tokenizer(prompt, return_tensors="pt")
    if torch.cuda.is_available():
        inputs = {k: v.to("cuda") for k, v in inputs.items()}

    with torch.inference_mode():
        outputs = _model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            min_new_tokens=28,
            temperature=temperature,
            top_p=top_p,
            repetition_penalty=1.1,
            do_sample=True,
            eos_token_id=CODE_END_TOKEN_ID,
            pad_token_id=_tokenizer.pad_token_id,
        )

    generated_ids = outputs[0, inputs["input_ids"].shape[1]:].tolist()

    # Extract SNAC codes
    try:
        eos_idx = generated_ids.index(CODE_END_TOKEN_ID)
    except ValueError:
        eos_idx = len(generated_ids)

    snac_codes = [
        t for t in generated_ids[:eos_idx]
        if SNAC_MIN_ID <= t <= SNAC_MAX_ID
    ]

    if len(snac_codes) < SNAC_TOKENS_PER_FRAME:
        raise ValueError(f"Not enough SNAC tokens generated: {len(snac_codes)}")

    # Unpack to 3 hierarchical levels
    frames = len(snac_codes) // SNAC_TOKENS_PER_FRAME
    snac_codes = snac_codes[:frames * SNAC_TOKENS_PER_FRAME]

    l1, l2, l3 = [], [], []
    for i in range(frames):
        s = snac_codes[i * 7:(i + 1) * 7]
        l1.append((s[0] - CODE_TOKEN_OFFSET) % 4096)
        l2.extend([(s[1] - CODE_TOKEN_OFFSET) % 4096, (s[4] - CODE_TOKEN_OFFSET) % 4096])
        l3.extend([
            (s[2] - CODE_TOKEN_OFFSET) % 4096,
            (s[3] - CODE_TOKEN_OFFSET) % 4096,
            (s[5] - CODE_TOKEN_OFFSET) % 4096,
            (s[6] - CODE_TOKEN_OFFSET) % 4096,
        ])

    device = "cuda" if torch.cuda.is_available() else "cpu"
    codes_tensor = [
        torch.tensor(level, dtype=torch.long, device=device).unsqueeze(0)
        for level in [l1, l2, l3]
    ]

    with torch.inference_mode():
        z_q = _snac.quantizer.from_codes(codes_tensor)
        audio = _snac.decoder(z_q)[0, 0].cpu().numpy()

    # Trim warmup
    if len(audio) > 2048:
        audio = audio[2048:]

    return audio, 24000
