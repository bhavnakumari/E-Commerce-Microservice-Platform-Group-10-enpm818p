import os
import time
from uuid import uuid4
import httpx
from fastapi import FastAPI, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
from prometheus_client import Histogram, Counter, generate_latest, CONTENT_TYPE_LATEST

from .schemas import Product, ProductCreate, ProductUpdate

app = FastAPI(
    root_path="/products",
    title="Products Service",
    version="0.4.0",
    description="Products microservice backed by MongoDB with simple string IDs.",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Prometheus Metrics ----
http_request_duration = Histogram(
    "http_server_requests_seconds",
    "HTTP server request duration in seconds",
    ["service", "method", "uri", "status"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
)

http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["service", "method", "uri", "status"],
)


@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    start = time.perf_counter()

    response = await call_next(request)

    latency = time.perf_counter() - start
    labels = {
        "service": "products-service",
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


# ---- Mongo config ----
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
MONGO_DB = os.getenv("MONGO_DB", "shop")
MONGO_COLLECTION = os.getenv("MONGO_PRODUCTS_COLLECTION", "products")

# ---- Inventory service config ----
INVENTORY_SERVICE_URL = os.getenv("INVENTORY_SERVICE_URL", "http://inventory:8000")

mongo_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global mongo_client
    if mongo_client is None:
        mongo_client = AsyncIOMotorClient(MONGO_URI)
    return mongo_client


def get_collection():
    client = get_client()
    return client[MONGO_DB][MONGO_COLLECTION]


async def get_inventory_stock(product_id: str) -> int:
    """Fetch real-time stock from inventory service."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{INVENTORY_SERVICE_URL}/api/inventory/{product_id}", timeout=2.0)
            if response.status_code == 200:
                data = response.json()
                return data.get("quantity", 0)
            return 0
    except Exception as e:
        # If inventory service is down, return 0
        print(f"Failed to fetch inventory for {product_id}: {e}")
        return 0


async def serialize_product(doc: dict) -> dict:
    """Convert Mongo document to dict matching Product schema with real-time inventory."""
    product_id = doc.get("id")
    # Fetch real-time stock from inventory service
    stock = await get_inventory_stock(product_id)

    return {
        "id": product_id,
        "name": doc.get("name"),
        "sku": doc.get("sku"),
        "description": doc.get("description"),
        "price": doc.get("price"),
        "stock": stock,  # Use real-time stock from inventory service
        "category": doc.get("category"),
        "imageUrl": doc.get("imageUrl"),
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "products"}


@app.get("/db-health")
async def db_health():
    client = get_client()
    db = client[MONGO_DB]
    res = await db.command("ping")
    return {"ok": res.get("ok", 0), "db": MONGO_DB}


# --------- LIST PRODUCTS ---------
@app.get("/api/products", response_model=list[Product])
async def list_products():
    coll = get_collection()
    cursor = coll.find({})
    docs = await cursor.to_list(length=1000)
    # Serialize products with real-time inventory
    products = []
    for doc in docs:
        product = await serialize_product(doc)
        products.append(product)
    return products


# --------- CREATE PRODUCT ---------
@app.post("/api/products", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate):
    coll = get_collection()

    # Enforce unique SKU
    existing = await coll.find_one({"sku": payload.sku})
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")

    data = payload.model_dump()
    data["id"] = str(uuid4())  # our own ID field

    await coll.insert_one(data)
    doc = await coll.find_one({"id": data["id"]})
    return await serialize_product(doc)


# --------- GET BY ID ---------
@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    coll = get_collection()
    doc = await coll.find_one({"id": product_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return await serialize_product(doc)


# --------- UPDATE PRODUCT ---------
@app.patch("/api/products/{product_id}", response_model=Product)
async def update_product(product_id: str, payload: ProductUpdate):
    coll = get_collection()

    # Build update dict from only provided fields
    update_data = {
        k: v for k, v in payload.model_dump(exclude_unset=True).items()
        if v is not None
    }

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # If SKU is being updated, enforce uniqueness
    if "sku" in update_data:
        existing = await coll.find_one({
            "sku": update_data["sku"],
            "id": {"$ne": product_id}
        })
        if existing:
            raise HTTPException(status_code=400, detail="SKU already exists")

    doc = await coll.find_one_and_update(
        {"id": product_id},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")

    return await serialize_product(doc)

# --------- DELETE PRODUCT ---------
@app.delete("/api/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    coll = get_collection()
    result = await coll.delete_one({"id": product_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    # 204 = no content
    return None