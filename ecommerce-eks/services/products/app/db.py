import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.collection import Collection

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
MONGO_DB = os.getenv("MONGO_DB", "shop")
MONGO_COLLECTION = os.getenv("MONGO_PRODUCTS_COLLECTION", "products")

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGO_URI)
    return _client


def get_collection() -> Collection:
    client = get_client()
    return client[MONGO_DB][MONGO_COLLECTION]


async def init_indexes():
    """
    Idempotent index creation on startup.
    """
    coll = get_collection()
    await coll.create_index("sku", unique=True)
    await coll.create_index("category")