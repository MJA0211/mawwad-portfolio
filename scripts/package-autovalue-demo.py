"""Encode the real browser capture and generate its captions and text walkthrough.

Run after record-autovalue-demo.mjs. Requires FFmpeg/FFprobe with libx264 and
libass on PATH or in Ubuntu WSL. Raw capture and session files stay in .local.
Usage: python scripts/package-autovalue-demo.py [capture directory]
"""

import hashlib
import html
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CAPTURE = Path(sys.argv[1] if len(sys.argv) > 1 else ".local/autovalue-demo-2026-10-01")
CAPTURE = (ROOT / CAPTURE).resolve()
MEDIA = ROOT / "site/public/videos"


def relative(file: Path) -> str:
    return file.resolve().relative_to(ROOT).as_posix()


def run(name: str, *args: str, capture: bool = False) -> str:
    if name not in {"ffmpeg", "ffprobe"}:
        raise ValueError("Unexpected media tool")
    native = shutil.which(name)
    command = [native] if native else ["wsl", "-d", "Ubuntu", "-u", "root", "--cd", str(ROOT), "--", name]
    result = subprocess.run(
        [*command, *args], cwd=ROOT, check=True, capture_output=capture,
        text=True, encoding="utf-8",
    )
    return result.stdout if capture else ""


def timestamp(seconds: float, ass: bool = False) -> str:
    base = 100 if ass else 1000
    whole, fraction = divmod(round(max(0, seconds) * base), base)
    hours, remainder = divmod(whole, 3600)
    minutes, sec = divmod(remainder, 60)
    return f"{hours}:{minutes:02}:{sec:02}.{fraction:02}" if ass else f"{hours:02}:{minutes:02}:{sec:02}.{fraction:03}"


def short_time(seconds: float) -> str:
    minutes, sec = divmod(int(seconds), 60)
    return f"{minutes:02}:{sec:02}"


def main() -> None:
    source = json.loads((CAPTURE / "capture.json").read_text(encoding="utf-8"))
    duration = source["trimEnd"] - source["trimStart"]
    if duration <= 0:
        raise ValueError("Empty capture")
    chapters = []
    for index, item in enumerate(source["chapters"]):
        end = source["chapters"][index + 1]["start"] if index + 1 < len(source["chapters"]) else source["trimEnd"]
        chapters.append({**item, "start": round(max(0, item["start"] - source["trimStart"]), 3), "end": round(end - source["trimStart"], 3)})

    vtt = ["WEBVTT", ""]
    metadata = [";FFMETADATA1", "title=AutoValue AI | Valuation and model walkthrough", "artist=Muhammed Awwad", "comment=Local prototype recording. Historical 2023 asking-price estimates; synthetic River replay."]
    subtitles = [
        "[Script Info]", "ScriptType: v4.00+", "PlayResX: 1600", "PlayResY: 1000", "WrapStyle: 2", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        "Style: Title,DejaVu Sans,24,&H0069F3CE,&H0069F3CE,&H0010160B,&H0010160B,-1,0,0,0,100,100,0,0,1,0,0,7,40,40,918,1",
        "Style: Caption,DejaVu Sans,21,&H00EDF4EE,&H00EDF4EE,&H0010160B,&H0010160B,0,0,0,0,100,100,0,0,1,0,0,7,40,40,957,1",
        "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    items = []
    for index, item in enumerate(chapters, 1):
        vtt.extend([str(index), f"{timestamp(item['start'])} --> {timestamp(item['end'])}", f"{item['title']}: {item['caption']}", ""])
        metadata.extend(["[CHAPTER]", "TIMEBASE=1/1000", f"START={round(item['start'] * 1000)}", f"END={round(item['end'] * 1000)}", f"title={item['title']}"])
        for style, text in [("Title", f"{index:02} / {item['title']}"), ("Caption", item["caption"])]:
            escaped = text.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}")
            subtitles.append(f"Dialogue: 0,{timestamp(item['start'], True)},{timestamp(item['end'], True)},{style},,0,0,0,,{escaped}")
        items.append(f"        <li><time>{short_time(item['start'])}</time><p>{html.escape(item['title'])}. {html.escape(item['caption'])}</p></li>")

    (CAPTURE / "captions.ass").write_text("\n".join(subtitles) + "\n", encoding="utf-8")
    (CAPTURE / "chapters.txt").write_text("\n".join(metadata) + "\n", encoding="utf-8")
    output = MEDIA / "autovalue-demo.mp4"
    run("ffmpeg", "-hide_banner", "-loglevel", "warning", "-y",
        "-ss", str(source["trimStart"]), "-i", relative(Path(source["rawVideo"])),
        "-i", relative(CAPTURE / "chapters.txt"), "-t", str(duration),
        "-map", "0:v:0", "-map_metadata", "1", "-map_chapters", "1",
        "-vf", f"pad=iw:ih+100:0:0:color=0x0b1610,drawbox=x=0:y=900:w=iw:h=2:color=0xcef369:t=fill,ass={relative(CAPTURE / 'captions.ass')}",
        "-r", "25", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", relative(output))
    probe = json.loads(run("ffprobe", "-v", "error", "-show_format", "-show_streams", "-show_chapters", "-of", "json", relative(output), capture=True))
    video = next(stream for stream in probe["streams"] if stream["codec_type"] == "video")
    assert video["codec_name"] == "h264" and video["pix_fmt"] == "yuv420p"
    assert (video["width"], video["height"]) == (1600, 1000)
    assert len(probe["chapters"]) == len(chapters)
    assert output.stat().st_size < 25 * 1024 * 1024
    run("ffmpeg", "-hide_banner", "-v", "error", "-i", relative(output), "-map", "0:v:0", "-f", "null", "-")
    (MEDIA / "autovalue-captions.vtt").write_text("\n".join(vtt), encoding="utf-8")
    walkthrough = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="description" content="Text walkthrough of the AutoValue AI demo video." />
    <meta name="theme-color" content="#0b0e12" />
    <title>AutoValue AI demo walkthrough | Muhammed Awwad</title>
    <link rel="icon" href="/favicon.svg" />
    <link rel="stylesheet" href="/videos/transcript.css" />
  </head>
  <body>
    <main class="wrap transcript">
      <a class="text-link" href="/#autovalue">← Back to AutoValue AI</a>
      <h1>AutoValue AI demo walkthrough</h1>
      <p>
        Recorded October 1, 2026. This silent, captioned recording follows real interactions
        with the local application and its verified RF05 model. Estimates reflect historical
        2023 U.S. advertised asking prices. The River segment replays synthetic research results.
        AutoValue AI remains in active development.
      </p>
      <a class="text-link" href="/videos/autovalue-demo.mp4">Open the recorded demo ↗</a>
      <ol>
ITEMS
      </ol>
      <a class="text-link" href="/#autovalue-case-study">Read the engineering notes →</a>
    </main>
  </body>
</html>
""".replace("ITEMS", "\n".join(items))
    (MEDIA / "autovalue-transcript.html").write_text(walkthrough, encoding="utf-8")
    report = {"recordedAt": source["recordedAt"], "duration": float(probe["format"]["duration"]),
              "bytes": output.stat().st_size, "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
              "video": video, "chapters": chapters, "assertions": source["assertions"]}
    (CAPTURE / "packaged.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"duration": report["duration"], "bytes": report["bytes"], "chapters": len(chapters)}))


if __name__ == "__main__":
    main()
