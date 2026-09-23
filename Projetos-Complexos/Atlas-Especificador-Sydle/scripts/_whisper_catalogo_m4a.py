# -*- coding: utf-8 -*-
"""Transcribe catalogo.m4a meeting audio with faster-whisper."""
from __future__ import annotations

from datetime import datetime
from pathlib import Path

SRC = Path(r"C:\Users\LucasSantos\Videos\catalogo.m4a")
OUT_DIR = Path(
    r"C:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\Especificador Sydle"
    r"\docs\conhecimento-atlas\transcricoes"
)
OUT = OUT_DIR / "AUDIO_catalogo_m4a.txt"
LOG = OUT_DIR.parent / "whisper_catalogo_m4a_log.txt"


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
        f"# Tipo: audio Whisper ({model_size})",
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
        if len(lines) % 40 == 0:
            OUT.write_text("\n".join(lines), encoding="utf-8")
            LOG.write_text(
                f"progress lines={len(lines)} last={t1}s\n", encoding="utf-8"
            )
    OUT.write_text("\n".join(lines), encoding="utf-8")
    msg = f"DONE {OUT} chars={OUT.stat().st_size} duration={getattr(info,'duration',None)}"
    print(msg)
    LOG.write_text(msg + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
