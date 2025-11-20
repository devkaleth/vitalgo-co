"""
VitalGo Backend API
Main FastAPI application entry point
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from slices.signup.infrastructure.api import patient_signup_router, validation_router
from slices.auth.infrastructure.api import auth_router
from slices.dashboard.infrastructure.api.dashboard_router import router as dashboard_router
from slices.medications.infrastructure.api.medications_router import router as medications_router
from slices.allergies.infrastructure.api.allergies_router import router as allergies_router
from slices.surgeries.infrastructure.api.surgeries_router import router as surgeries_router
from slices.illnesses.infrastructure.api.illnesses_router import router as illnesses_router
from slices.profile.infrastructure.api.profile_endpoints import router as profile_router
from slices.qr.infrastructure.api.qr_simple_router import router as qr_router
from slices.emergency_access.infrastructure.api.emergency_access_router import router as emergency_access_router
from slices.countries.infrastructure.api.countries_router import router as countries_router
from slices.subscriptions.infrastructure.api.subscriptions_router import router as subscriptions_router

# Create FastAPI app instance
app = FastAPI(
    title="VitalGo API",
    description="VitalGo Backend API following Hexagonal Architecture",
    version="0.1.0"
)

# Configure CORS - SECURITY HARDENED
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),  # Configurable origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Specific methods only
    allow_headers=["Content-Type", "Authorization", "Accept"],  # Specific headers only
)

# Register routers
app.include_router(patient_signup_router)
app.include_router(validation_router)
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(medications_router)
app.include_router(allergies_router)
app.include_router(surgeries_router)
app.include_router(illnesses_router)
app.include_router(profile_router)
app.include_router(qr_router)
app.include_router(emergency_access_router)
app.include_router(countries_router)
app.include_router(subscriptions_router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "VitalGo API is running", "status": "healthy"}


@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "service": "vitalgo-backend",
        "version": "0.1.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)