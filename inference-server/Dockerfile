FROM runpod/pytorch:2.8.0-py3.12-cuda12.8.1-cudnn-devel-ubuntu22.04

ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/cache/huggingface

RUN apt-get update && apt-get install -y \
    libsndfile1 ffmpeg sox && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "from huggingface_hub import snapshot_download; \
    snapshot_download('Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', cache_dir='/cache/huggingface'); \
    snapshot_download('Qwen/Qwen3-TTS-12Hz-1.7B-Base', cache_dir='/cache/huggingface'); \
    snapshot_download('Qwen/Qwen3-TTS-Tokenizer-12Hz', cache_dir='/cache/huggingface')"

COPY model.py .
COPY handler.py .

CMD ["python", "handler.py"]
