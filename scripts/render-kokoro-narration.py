from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--voice", default="af_bella")
    parser.add_argument("--speed", type=float, default=1.12)
    args = parser.parse_args()

    args.output_dir.mkdir(parents=True, exist_ok=True)
    pipeline = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M")
    separator = np.zeros(round(0.08 * 24_000), dtype=np.float32)

    for source in sorted(args.input_dir.glob("*.txt")):
        text = source.read_text(encoding="utf-8").strip()
        pieces: list[np.ndarray] = []
        for result in pipeline(text, voice=args.voice, speed=args.speed):
            if result.audio is not None:
                pieces.append(result.audio.detach().cpu().numpy())
        if not pieces:
            raise RuntimeError(f"No speech was generated for {source.name}")
        audio = np.concatenate(
            [part for piece in pieces for part in (piece, separator)][:-1]
        )
        destination = args.output_dir / f"{source.stem}.wav"
        sf.write(destination, audio, 24_000, subtype="PCM_16")
        print(f"{destination.name}: {len(audio) / 24_000:.2f}s")


if __name__ == "__main__":
    main()
