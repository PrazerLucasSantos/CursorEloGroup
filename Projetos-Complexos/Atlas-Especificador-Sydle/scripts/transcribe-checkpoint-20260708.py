"""Transcreve Checkpoint Atlas 08/07/2026 com faster_whisper."""
from pathlib import Path
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "docs/_fontes_txt/Checkpoint Atlas-20260708.wav"
OUT = ROOT / "docs/_fontes_txt/Checkpoint Atlas-20260708.txt"

def main():
    print("Carregando modelo small...")
    model = WhisperModel("small", device="cpu", compute_type="int8")
    print("Transcrevendo...")
    segments, info = model.transcribe(
        str(AUDIO),
        language="pt",
        beam_size=5,
        vad_filter=True,
    )
    lines = [
        "Checkpoint Atlas-20260708_193146UTC-Meeting Recording",
        f"Idioma detectado: {info.language} (prob {info.language_probability:.2f})",
        "",
    ]
    for seg in segments:
        m, s = divmod(int(seg.start), 60)
        h, m = divmod(m, 60)
        ts = f"{h:02d}:{m:02d}:{s:02d}"
        lines.append(f"[{ts}] {seg.text.strip()}")
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Salvo: {OUT} ({len(lines)} linhas)")

if __name__ == "__main__":
    main()
