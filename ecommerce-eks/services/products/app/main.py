import os
from uuid import uuid4

from fastapi import FastAPI, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument

from .schemas import Product, ProductCreate, ProductUpdate

app = FastAPI(
    title="Products Service",
    version="0.4.0",
    description="Products microservice backed by MongoDB with simple string IDs.",
)

# ---- Mongo config ----
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
MONGO_DB = os.getenv("MONGO_DB", "shop")
MONGO_COLLECTION = os.getenv("MONGO_PRODUCTS_COLLECTION", "products")

mongo_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global mongo_client
    if mongo_client is None:
        mongo_client = AsyncIOMotorClient(MONGO_URI)
    return mongo_client


def get_collection():
    client = get_client()
    return client[MONGO_DB][MONGO_COLLECTION]


def serialize_product(doc: dict) -> dict:
    """Convert Mongo document to dict matching Product schema."""
    return {
        "id": doc.get("id"),  # our own stable string ID
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


# --------- LIST PRODUCTS ---------
@app.get("/api/products", response_model=list[Product])
async def list_products():
    coll = get_collection()
    cursor = coll.find({})
    docs = await cursor.to_list(length=1000)
    return [serialize_product(d) for d in docs]


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
    return serialize_product(doc)


# --------- GET BY ID ---------
@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    coll = get_collection()
    doc = await coll.find_one({"id": product_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_product(doc)


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

    return serialize_product(doc)

# --------- DELETE PRODUCT ---------
@app.delete("/api/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    coll = get_collection()
    result = await coll.delete_one({"id": product_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    # 204 = no content
    return None