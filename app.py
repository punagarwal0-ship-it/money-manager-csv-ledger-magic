import os
from codefinance import app


if __name__ == "__main__":
    # Allow running locally with the PORT env var (Render sets $PORT)
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
