import os
import json

WORKSPACE = "/Users/a0868519734/Downloads/strapi-file"

def clean_file(filepath):
    # Ignore node_modules, .git, and package-lock.json
    if "node_modules" in filepath or ".git" in filepath or "package-lock.json" in filepath:
        return

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read().strip()
    except Exception as e:
        print(f"Skipping binary/unread file {filepath}: {e}")
        return

    # Check if the content is double-serialized
    if content.startswith('"') and content.endswith('"'):
        print(f"Detected potential double-serialized file: {filepath}")
        try:
            # Parse the outer JSON string
            parsed = json.loads(content)
            if isinstance(parsed, str):
                # Sometimes it might be double-serialized even further
                if parsed.startswith('"') and parsed.endswith('"'):
                    try:
                        parsed = json.loads(parsed)
                    except Exception:
                        pass
                
                # Write back as clean string
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(parsed)
                print(f"  Successfully cleaned: {filepath}")
            else:
                # If it's a JSON object/array directly loaded from a JSON string
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(parsed, f, indent=2, ensure_ascii=False)
                print(f"  Successfully cleaned JSON object: {filepath}")
        except Exception as e:
            print(f"  Failed to clean {filepath}: {e}")

def walk_and_clean(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            clean_file(os.path.join(root, file))

if __name__ == "__main__":
    print("Starting workspace cleaning...")
    walk_and_clean(os.path.join(WORKSPACE, "backend"))
    walk_and_clean(os.path.join(WORKSPACE, "frontend"))
    print("Workspace cleaning complete.")
