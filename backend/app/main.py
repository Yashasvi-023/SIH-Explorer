from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models import ProblemStatement
from app.api.problems import router as problems_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="SIH Explorer API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(problems_router)


@app.get("/")
def root():
    return {
        "name": "SIH Explorer",
        "status": "running"
    }