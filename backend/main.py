import routes as routes
import uvicorn
import subprocess
import threading
from dotenv import load_dotenv

load_dotenv()


def run_fastapi():
    uvicorn.run("routes:app", host="localhost", port=8000, reload=True)


def run_react():
    react_process = subprocess.Popen(["npm.cmd", "run", "dev"], cwd="frontend")
    react_process.wait()


if __name__ == "__main__":
    # Run React in a separate thread or process
    react_thread = threading.Thread(target=run_react)
    react_thread.start()

    # Run FastAPI (blocking call)
    run_fastapi()

    # Wait for React thread to finish if FastAPI stops
    react_thread.join()
