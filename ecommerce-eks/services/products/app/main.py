import os
from typing import List

from fastapi import FastAPI, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

app = FastAPI(
    title="Products Service",
    version="0.1.0",
    description="Products microservice backed by MongoDB.",
)

# ---- Mongo config ----
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
MONGO_DB = os.getenv("MONGO_DB", "shop")
MONGO_COLLECTION = os.getenv("MONGO_PRODUCTS_COLLECTION", "products")

mongo_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    """Return a global Mongo client."""
    global mongo_client
    if mongo_client is None:
        mongo_client = AsyncIOMotorClient(MONGO_URI)
    return mongo_client


def get_collection():
    """Return the products collection."""
    client = get_client()
    return client[MONGO_DB][MONGO_COLLECTION]


def serialize_product(doc: dict) -> dict:
    """Convert Mongo document to a JSON-safe dict."""
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name"),
        "sku": doc.get("sku"),
        "description": doc.get("description"),
        "price": doc.get("price"),
        "stock": doc.get("stock"),
        "category": doc.get("category"),
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


# --------- API: LIST PRODUCTS ---------
@app.get("/api/products")
async def list_products():
    coll = get_collection()
    cursor = coll.find({})
    docs = await cursor.to_list(length=1000)
    return [serialize_product(d) for d in docs]


# --------- API: CREATE PRODUCT ---------
@app.post("/api/products", status_code=status.HTTP_201_CREATED)
async def create_product(payload: dict):
    """
    Create a product in MongoDB.
    Required fields: name, sku, price, stock
    """
    required_fields = ["name", "sku", "price", "stock"]
    missing = [f for f in required_fields if f not in payload]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required fields: {', '.join(missing)}",
        )

    coll = get_collection()

    # Unique SKU
    existing = await coll.find_one({"sku": payload["sku"]})
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")

    result = await coll.insert_one(payload)
    new_doc = await coll.find_one({"_id": result.inserted_id})
    return serialize_product(new_doc)


# --------- API: GET BY ID ---------
@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    coll = get_collection()
    doc = await coll.find_one({"_id": ObjectId(product_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")

    return serialize_product(doc)