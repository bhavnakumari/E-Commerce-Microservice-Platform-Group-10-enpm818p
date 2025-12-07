import os
import time
import redis
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Histogram, Counter, generate_latest, CONTENT_TYPE_LATEST

app = FastAPI(
    root_path="/inventory",
    title="Inventory Service",
    version="0.2.0",
    description="Inventory microservice backed by Redis.",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

redis_client: redis.Redis | None = None

# ---------- Prometheus Metrics ----------

# Histogram for request duration
http_request_duration = Histogram(
    "http_server_requests_seconds",
    "HTTP server request duration in seconds",
    ["service", "method", "uri", "status"],   # 👈 add "service"
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
)

# Counter for total requests
http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["service", "method", "uri", "status"],   # 👈 add "service"
)


@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    start = time.perf_counter()

    response = await call_next(request)

    latency = time.perf_counter() - start
    labels = {
        "service": "inventory-service",                 # 👈 new
        "method": request.method,
        "uri": request.url.path,
        "status": str(response.status_code),
    }

    http_request_duration.labels(**labels).observe(latency)
    http_requests_total.labels(**labels).inc()

    return response


@app.get("/metrics")
def metrics() -> Response:
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)


# ---------- Redis Helper ----------

def get_redis() -> redis.Redis:
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    return redis_client


@app.get("/health")
async def health():
    return {"status": "ok", "service": "inventory"}


@app.get("/inventory/health")
async def inventory_health():
    try:
        client = get_redis()
        pong = client.ping()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Redis error: {e!r}")
    return {"status": "ok" if pong else "fail", "backend": "redis"}


# ---------- BASIC STOCK API ----------

def stock_key(product_id: str) -> str:
    return f"stock:{product_id}"


@app.get("/api/inventory/{product_id}")
async def get_stock(product_id: str):
    """
    Get current stock for a product.
    Returns 0 if the product has no stock entry yet.
    """
    client = get_redis()
    value = client.get(stock_key(product_id))
    qty = int(value) if value is not None else 0
    return {"productId": product_id, "quantity": qty}


@app.put("/api/inventory/{product_id}")
async def set_stock(product_id: str, payload: dict):
    """
    Set stock quantity for a product.
    Expected body: { "quantity": 10 }
    """
    if "quantity" not in payload:
        raise HTTPException(status_code=400, detail="Missing 'quantity'")
    try:
        qty = int(payload["quantity"])
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="'quantity' must be an integer")

    if qty < 0:
        raise HTTPException(status_code=400, detail="quantity cannot be negative")

    client = get_redis()
    client.set(stock_key(product_id), qty)
    return {"productId": product_id, "quantity": qty}