# -*- coding: utf-8 -*-
"""build_mcp_test.py - single shot test"""
import json
import os

IMG = r"D:\YouTubeVideo\luhuo-mp4\img\ChatGPT Image 2026年6月27日 17_09_39 (1).png"
OUT = r"D:\YouTubeVideo\luhuo-mp4\mcp_test.json"

payload = {
    "requests": [
        {
            "prompt": "test",
            "input_image": {"file": IMG},
            "reference_type": "first_frame",
            "duration": 6,
            "resolution": "1080P",
        }
    ]
}

with open(OUT, "w", encoding="utf-8") as fp:
    json.dump(payload, fp, ensure_ascii=False)

print(f"Wrote {OUT}")
print(f"File exists: {os.path.exists(IMG)} ({os.path.getsize(IMG)} bytes)")
