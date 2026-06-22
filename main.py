import os
import json
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="GameTrack API")

# Enable CORS for local/dev requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'data/library.json')
STATIC_DIR = os.path.join(BASE_DIR, 'static')

def init_db():
    db_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
    if not os.path.exists(DB_PATH):
        with open(DB_PATH, 'w', encoding='utf-8') as f:
            json.dump([], f, indent=2)

init_db()

@app.get("/api/library")
async def get_library():
    try:
        init_db()
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            library = json.load(f)
        return library
    except Exception as e:
        print(f"Error reading library database: {e}")
        raise HTTPException(status_code=500, detail="Failed to read library database")

@app.post("/api/library")
async def save_library(request: Request):
    try:
        init_db()
        library = await request.json()
        if not isinstance(library, list):
            raise HTTPException(status_code=400, detail="Invalid data format. Expected an array of games.")
        
        with open(DB_PATH, 'w', encoding='utf-8') as f:
            json.dump(library, f, indent=2)
            
        return {"success": True, "count": len(library)}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error writing to library database: {e}")
        raise HTTPException(status_code=500, detail="Failed to save library database")

# Serve frontend from static folder if it exists
if os.path.exists(STATIC_DIR):
    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        # Ignore API calls
        if catchall.startswith("api"):
            raise HTTPException(status_code=404, detail="Not Found")
            
        # Check if file exists in static
        file_path = os.path.join(STATIC_DIR, catchall)
        if catchall and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Otherwise serve index.html for SPA routing
        index_path = os.path.join(STATIC_DIR, 'index.html')
        if os.path.exists(index_path):
            return FileResponse(index_path)
            
        raise HTTPException(status_code=404, detail="Not Found")

if __name__ == "__main__":
    import uvicorn
    print("[GameTrack FastAPI Server] Running at http://localhost:3001")
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)
