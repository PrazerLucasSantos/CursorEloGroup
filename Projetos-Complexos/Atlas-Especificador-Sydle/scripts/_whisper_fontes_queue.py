"""
Transcribe unique meeting videos (faster-whisper) into docs/conhecimento-atlas/transcricoes.
Uses whisper_queue.json produced by _build_conhecimento_fontes.py.
Processes one by one; skip if transcript already exists.
"""
from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path

OUT = Path(
    r"C:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\Especificador Sydle"
    r"\docs\conhecimento-atlas"
)
QUEUE = OUT / "whisper_queue.json"
TX = OUT / "transcricoes"
LOG = OUT / "whisper_log.txt"


def slug(name: str) -> str:
    import re

    s = re.sub(r"[^\w\-]+", "_", name)
    return s.strip("_")[:100]


def main():
    TX.mkdir(parents=True, exist_ok=True)
    if not QUEUE.exists():
        print("No queue. Run _build_conhecimento_fontes.py first.")
        return 1

    items = json.loads(QUEUE.read_text(encoding="utf-8"))
    # optional: also force list from argv paths
    limit = None
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])
    if limit:
        items = items[:limit]

    from faster_whisper import WhisperModel

    # small = balance speed/quality for pt meetings
    model_size = "small"
    if "--tiny" in sys.argv:
        model_size = "tiny"
    if "--medium" in sys.argv:
        model_size = "medium"

    print(f"Loading faster-whisper {model_size}…")
    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    log_lines = [f"=== {datetime.now().isoformat()} model={model_size} items={len(items)} ==="]

    for i, item in enumerate(items, 1):
        path = Path(item["canonical_path"])
        out = TX / f"VIDEO_{slug(path.stem)}.txt"
        if out.exists() and out.stat().st_size > 2000:
            msg = f"[{i}/{len(items)}] SKIP exists {out.name}"
            print(msg)
            log_lines.append(msg)
            continue
        if not path.exists():
            msg = f"[{i}/{len(items)}] MISSING {path}"
            print(msg)
            log_lines.append(msg)
            continue

        print(f"[{i}/{len(items)}] Transcribing {path.name} ({item.get('mb')} MB)…")
        log_lines.append(f"START {path.name}")
        LOG.write_text("\n".join(log_lines), encoding="utf-8")

        segments, info = model.transcribe(
            str(path),
            language="pt",
            vad_filter=True,
            beam_size=1,
        )
        lines = [
            f"# Fonte: {path.name}",
            f"# Tipo: video/audio Whisper ({model_size})",
            f"# Duration_s: {getattr(info, 'duration', None)}",
            f"# Extraído: {datetime.now().isoformat(timespec='seconds')}",
            "",
        ]
        for seg in segments:
            t0 = int(seg.start)
            t1 = int(seg.end)
            lines.append(f"[{t0 // 60:02d}:{t0 % 60:02d} → {t1 // 60:02d}:{t1 % 60:02d}] {seg.text.strip()}")
        out.write_text("\n".join(lines), encoding="utf-8")
        msg = f"DONE {out.name} chars={out.stat().st_size}"
        print(msg)
        log_lines.append(msg)
        LOG.write_text("\n".join(log_lines), encoding="utf-8")

    print("Queue finished.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
