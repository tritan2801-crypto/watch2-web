"import json
import os
import re

LOGS_PATH = "/Users/a0868519734/.gemini/antigravity-ide/brain/3801c0fe-f886-4dc4-928e-febf999ff475/.system_generated/logs/transcript.jsonl"
PROJECT_ROOT = "/Users/a0868519734/Downloads/strapi-file"

def clean_content(content):
    if not content:
        return ""
    # Strip enclosing quotes if string was double-serialized
    if content.startswith('"') and content.endswith('"'):
        try:
            return json.loads(content)
        except Exception:
            pass
    # Decode escaped newlines and unicode characters
    content = content.replace('\\
', '\
').replace('\\	', '\	').replace('\\"', '"').replace('\\\\', '\\')
    return content

def restore():
    print(f"Reading logs from {LOGS_PATH}...")
    if not os.path.exists(LOGS_PATH):
        print("Error: Logs path does not exist!")
        return

    written_files = {}

    with open(LOGS_PATH, "r", encoding="utf-8") as f:
        for line in f:
            try:
                step = json.loads(line)
                tool_calls = step.get("tool_calls", [])
                if not tool_calls:
                    continue
                
                for call in tool_calls:
                    name = call.get("name")
                    args = call.get("args", {})
                    
                    if not args:
                        continue
                        
                    # Handle both dict-like args and serialized args string
                    if isinstance(args, str):
                        try:
                            args = json.loads(args)
                        except Exception:
                            continue

                    target_file = args.get("TargetFile") or args.get("targetFile")
                    if not target_file:
                        continue

                    # Clean target file path
                    target_file = target_file.strip('"').strip("'"
<truncated 1742 bytes>