import os
import sys
import uvicorn

# Add project root to sys.path
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.append(project_root)

def main():
    print("Starting NNUE Chess Adversary Server...")
    # Run the uvicorn server pointing to src/api.py app
    uvicorn.run("src.api:app", host="0.0.0.0", port=8000, reload=False)


if __name__ == "__main__":
    main()
