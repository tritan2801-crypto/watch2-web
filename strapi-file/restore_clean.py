import json
import os

LOGS_PATH = "/Users/a0868519734/.gemini/antigravity-ide/brain/3801c0fe-f886-4dc4-928e-febf999ff475/.system_generated/logs/transcript.jsonl"
PROJECT_ROOT = "/Users/a0868519734/Downloads/strapi-file"

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
                
                # Check for tool_calls in planner_response or other steps
                tool_calls = []
                # Check different nested properties for tool calls
                if "tool_calls" in step:
                    tool_calls = step["tool_calls"]
                elif "planner_response" in step and isinstance(step["planner_response"], dict):
                    tool_calls = step["planner_response"].get("tool_calls", [])
                
                if not tool_calls and "content" in step:
                    # Sometimes the log contains tool calls embedded in a different format
                    pass

                for call in tool_calls:
                    name = call.get("name")
                    args = call.get("args", {})
                    
                    if not args:
                        continue
                        
                    if isinstance(args, str):
                        try:
                            args = json.loads(args)
                        except Exception:
                            continue

                    target_file = args.get("TargetFile") or args.get("targetFile")
                    if not target_file:
                        continue

                    # Clean target file path
                    target_file = target_file.strip('"').strip("'")
                    if not target_file.startswith(PROJECT_ROOT):
                        continue

                    # If it's a write_to_file call, store the latest content
                    if "write_to_file" in name:
                        content = args.get("CodeContent") or args.get("codeContent")
                        if content is not None:
                            written_files[target_file] = content
                            print(f"Found write_to_file for: {target_file}")
            except Exception as e:
                continue

    print(f"\nRestoring {len(written_files)} files...")
    for path, content in written_files.items():
        # Skip if path contains '<truncated'
        if "<truncated" in path:
            continue
            
        # Check if the content is truncated
        if "<truncated" in content:
            print(f"Warning: Skipping file because its content in logs contains a truncation marker: {path}")
            continue

        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Restored: {path} ({len(content)} bytes)")

if __name__ == "__main__":
    restore()
