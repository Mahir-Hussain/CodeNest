from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import backend.api
import uvicorn


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # React dev server
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


if __name__ == '__main__':
    uvicorn.run(backend.api.app, port=8080, host='127.0.0.1')  # Run the FastAPI app on port 8080