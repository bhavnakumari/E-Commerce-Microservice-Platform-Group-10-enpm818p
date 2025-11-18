# services/products/app/schemas.py
from typing import Optional
from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(..., example="Classic T-Shirt")
    sku: str = Field(..., example="TS001")
    description: Optional[str] = Field(None, example="100% cotton")
    price: float = Field(..., gt=0, example=19.99)
    stock: int = Field(..., ge=0, example=50)
    category: Optional[str] = Field(None, example="apparel")
    imageUrl: Optional[str] = Field(None, example="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    category: Optional[str] = None
    imageUrl: Optional[str] = None


class Product(ProductBase):
    id: str = Field(..., example="a96f3a4e-6fb8-4e40-8dc3-01a7f29c9a0f")