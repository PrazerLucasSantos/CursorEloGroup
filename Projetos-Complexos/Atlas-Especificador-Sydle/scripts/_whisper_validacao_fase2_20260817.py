# -*- coding: utf-8 -*-
"""Transcribe [Atlas] Validação de Requisitos - Fase 2 meeting (2026-08-17)."""
from __future__ import annotations

from datetime import datetime
from pathlib import Path

SRC = Path(
    r"c:\Users\LucasSantos\Documents\Elogroup - Teams"
    r"\[Atlas] Validação de Requisitos - Fase 2-20260817_180439-Gravação de Reunião.mp4"
)
OUT_DIR = Path(__file__).resolve().parents[1] / "docs" / "conhecimento-atlas" / "transcricoes"
OUT = OUT_DIR / "VIDEO_Validacao_Fase2_20260817_whisper.txt"
LOG = OUT_DIR / "whisper_validacao_fase2_20260817_log.txt"


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if not SRC.exists():
        print("MISSING", SRC)
        return 1

    from faster_whisper import WhisperModel

    model_size = "small"
    print(f"Loading faster-whisper {model_size}…")
    LOG.write_text(f"START {datetime.now().isoformat()} {SRC}\n", encoding="utf-8")
    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    print(f"Transcribing {SRC.name} ({SRC.stat().st_size / 1e6:.1f} MB)…")
    segments, info = model.transcribe(
        str(SRC),
        language="pt",
        vad_filter=True,
        beam_size=1,
    )
    lines = [
        f"# Fonte: {SRC.name}",
        f"# Tipo: video Whisper faster-whisper ({model_size})",
        f"# Duration_s: {getattr(info, 'duration', None)}",
        f"# Extraído: {datetime.now().isoformat(timespec='seconds')}",
        "",
    ]
    for seg in segments:
        t0 = int(seg.start)
        t1 = int(seg.end)
        lines.append(
            f"[{t0 // 60:02d}:{t0 % 60:02d} → {t1 // 60:02d}:{t1 % 60:02d}] {seg.text.strip()}"
        )
        if len(lines) % 50 == 0:
            LOG.write_text(
                LOG.read_text(encoding="utf-8") + f"progress lines={len(lines)} last={t1}s\n",
                encoding="utf-8",
            )
    OUT.write_text("\n".join(lines), encoding="utf-8")
    msg = f"DONE {OUT} chars={OUT.stat().st_size} duration={getattr(info, 'duration', None)}"
    print(msg)
    LOG.write_text(LOG.read_text(encoding="utf-8") + msg + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
