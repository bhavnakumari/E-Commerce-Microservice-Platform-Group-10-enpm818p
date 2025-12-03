"""
Pytest fixtures and configuration for products service tests
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    from app.main import app
    return TestClient(app)


@pytest.fixture
def sample_product():
    """Sample product data for testing."""
    return {
        "id": str(uuid4()),
        "name": "Test Product",
        "sku": "TEST-SKU-001",
        "description": "Test product description",
        "price": 29.99,
        "stock": 100,
        "category": "electronics",
        "imageUrl": "https://example.com/test-product.jpg"
    }


@pytest.fixture
def sample_product_create():
    """Sample product creation payload."""
    return {
        "name": "New Test Product",
        "sku": "NEW-SKU-001",
        "description": "New product for testing",
        "price": 49.99,
        "stock": 50,
        "category": "apparel",
        "imageUrl": "https://example.com/new-product.jpg"
    }
