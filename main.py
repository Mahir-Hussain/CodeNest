from fastapi.middleware.cors import CORSMiddleware
import backend.api as api
import uvicorn
import subprocess
import threading

api.app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_fastapi():
    uvicorn.run("backend.api:app", host="127.0.0.1", port=8000, reload=True)

def run_react():
    react_process = subprocess.Popen(['npm.cmd', 'run', 'dev'], cwd='./frontend')
    react_process.wait()

if __name__ == "__main__":
    # Run React in a separate thread or process
    react_thread = threading.Thread(target=run_react)
    react_thread.start()

    # Run FastAPI (blocking call)
    run_fastapi()

    # Wait for React thread to finish if FastAPI stops
    react_thread.join()