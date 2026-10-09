from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import auth, users, brokers, orders, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed initial admin & sample users
    init_db()
    yield


app = FastAPI(
    title="Astra Trading - Super Admin Terminal API",
    description="Backend API for Astra Trading Super Admin Terminal with Broker Integration, Live Order Controls, and Alerts.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(brokers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/api/health", tags=["health"])
def health_check():
    return {
        "status": "online",
        "service": "Astra Trading Super Admin Terminal",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
