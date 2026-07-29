#!/usr/bin/env python3
"""Export the Trainer Copilot data-contract manifest from the canonical
content JSON. Pure re-projection — no content is authored here.

Usage: python3 scripts/export_contract.py [--content app/public/content/chapter2_section1.json] [--out app/public/contract/v1]
"""
import argparse
import json
from pathlib import Path

CONTRACT_VERSION = "1.0.0"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--content", default="app/public/content/chapter2_section1.json")
    ap.add_argument("--out", default="app/public/contract/v1")
    args = ap.parse_args()

    content = json.load(open(args.content))
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    manifest = {
        "contract_version": CONTRACT_VERSION,
        "read_only": True,
        "grounding_rule": (
            "Every answer must cite the provenance of the field it came from. "
            "Any query touching a field whose status is pending must be answered "
            "with the standard refusal: 'Not yet authorized in the source manual.' "
            "No endpoint in this contract permits authoring, inferring, or "
            "paraphrasing drill content."
        ),
        "source": content["manual"],
        "ingestion": content["ingestion"],
        "endpoints": {
            "canonical_content": "/content/chapter2_section1.json",
            "companion_videos": "/content/videos.json",
            "generation_boundary": "/contract/v1/generation-boundary.json",
        },
        "drills": [
            {
                "drill_id": d["drill_id"],
                "names": d["names"],
                "content_status": d["content_status"],
                "missing_tables": d["missing_tables"],
                "pending_figure_slots": d["pending_figure_slots"],
            }
            for d in content["drills"]
        ],
        "glossary_terms": len(content["glossary"]),
    }
    with open(out / "manifest.json", "w") as f:
        json.dump(manifest, f, indent=1, ensure_ascii=False)
    print(f"wrote {out/'manifest.json'} (contract v{CONTRACT_VERSION})")


if __name__ == "__main__":
    main()
