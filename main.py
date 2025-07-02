from fastapi.middleware.cors import CORSMiddleware
import backend.routes as routes
import uvicorn
import subprocess
import threading
import logging

logging.info("Starting CodeNest API")
logging.basicConfig(level=logging.INFO)


def run_fastapi():
    uvicorn.run("backend.routes:app", host="127.0.0.1", port=8000, reload=True)


def run_react():
    react_process = subprocess.Popen(["npm.cmd", "run", "dev"], cwd="./frontend")
    react_process.wait()


if __name__ == "__main__":
    # Run React in a separate thread or process
    react_thread = threading.Thread(target=run_react)
    react_thread.start()

    # Run FastAPI (blocking call)
    run_fastapi()

    # Wait for React thread to finish if FastAPI stops
    react_thread.join()
