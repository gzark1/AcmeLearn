"""
AcmeLearn FastAPI Application Entry Point

This is the main entry point for the AcmeLearn backend API.
"""

from fastapi import FastAPI

app = FastAPI(
    title="AcmeLearn API",
    description="AI-powered learning recommendation system",
    version="0.1.0"
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AcmeLearn API is running"}


@app.get("/health")
async def health():
    """Health check for monitoring"""
    return {"status": "healthy"}
