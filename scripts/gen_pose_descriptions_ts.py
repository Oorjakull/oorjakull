"""Generate frontend/src/data/poseDescriptions.ts from pose_library.json.
Handles duplicate Sanskrit names (left/right variants) and escapes for TS strings.
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[1]
LIB = json.load(open(ROOT / "backend" / "data" / "pose_library.json"))


def _esc(s: str) -> str:
    """Escape for use inside a TS single-quoted string."""
    s = s.replace("\\", "\\\\")
    s = s.replace("'", "\\'")
    s = s.replace("\u2019", "\\'")       # right curly quote
    s = s.replace("\u2018", "\\'")       # left curly quote
    s = s.replace("\u201c", '\\"')       # left double curly
    s = s.replace("\u201d", '\\"')       # right double curly
    # Fix mojibake from UTF-8 read as latin1
    s = re.sub(r'â€™', "\\'", s)
    return s


def _build_benefits(p: dict) -> str:
    benefits = p.get("benefits", [])
    if not benefits:
        return p.get("summary", "")
    return ". ".join(benefits[:4]) + "."


def _build_intro(p: dict) -> str:
    name_en = _esc(p["name_en"])
    name_sa = _esc(p["name_sa"])
    summary = _esc(p["summary"])
    voice = _esc(p.get("voice_script_short", ""))
    cues = p.get("alignment_cues", [])

    lines = []
    if p["name_en"] != p["name_sa"]:
        lines.append(f"Welcome to {name_en} \\u2014 {name_sa}.")
    else:
        lines.append(f"Welcome to {name_en}.")
    lines.append(summary)
    if cues:
        cue_str = _esc(", ".join(cues[:3]).lower())
        lines.append(f"Focus on: {cue_str}.")
    if voice:
        lines.append(voice)
    lines.append("Step into the frame and let\\'s begin.")
    return " ".join(lines)


def _entry(key: str, p: dict) -> str:
    en = _esc(p["name_en"])
    sa = _esc(p["name_sa"])
    benefits = _esc(_build_benefits(p))
    intro = _build_intro(p)
    return (
        f"  '{_esc(key)}': {{\n"
        f"    englishName: '{en}',\n"
        f"    sanskritName: '{sa}',\n"
        f"    benefits: '{benefits}',\n"
        f"    introScript: '{intro}',\n"
        f"  }}"
    )


# Build entries  use name_en as primary key (unique even for left/right pairs)
entries: list[str] = []
seen_keys: set[str] = set()

for p in LIB:
    key = p["name_en"]
    if key in seen_keys:
        # Append pose_id to disambiguate
        key = f"{p['name_en']} ({p['pose_id']})"
    seen_keys.add(key)
    entries.append(_entry(key, p))

# Also add name_sa aliases (last one wins for duplicates  fine for lookups)
for p in LIB:
    key = p["name_sa"]
    if key not in seen_keys:
        seen_keys.add(key)
        entries.append(_entry(key, p))

# Add legacy keys used in old frontend code
LEGACY_MAP = {
    "Tadasana": "mountain_pose",
    "Down Dog": "down_dog",
    "Plank": "plank_pose",
    "Warrior II": "warrior_ii",
}
for legacy_key, pose_id in LEGACY_MAP.items():
    if legacy_key not in seen_keys:
        p = next((x for x in LIB if x["pose_id"] == pose_id), None)
        if p:
            seen_keys.add(legacy_key)
            entries.append(_entry(legacy_key, p))


# Write the file
header = (
    "export type PoseDescription = {\n"
    "  englishName: string\n"
    "  sanskritName: string\n"
    "  benefits: string\n"
    "  introScript: string\n"
    "}\n"
    "\n"
    "export const POSE_DESCRIPTIONS: Record<string, PoseDescription> = {\n"
)

out = ROOT / "frontend" / "src" / "data" / "poseDescriptions.ts"
with open(out, "w", encoding="utf-8") as f:
    f.write(header)
    f.write(",\n".join(entries))
    f.write("\n}\n")

print(f"Wrote {len(entries)} entries to {out}")
