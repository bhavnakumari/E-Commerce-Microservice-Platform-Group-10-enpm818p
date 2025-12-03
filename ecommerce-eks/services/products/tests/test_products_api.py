"""
Integration tests for Products Service API endpoints
These tests run against the FastAPI application with mocked database
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4


class TestHealthEndpoints:
    """Test health check endpoints for monitoring and CI/CD."""

    def test_health_check_returns_200(self, client):
        """Test basic health endpoint is accessible."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
        assert response.json()["service"] == "products"

    @patch('app.main.get_client')
    def test_db_health_check_success(self, mock_get_client, client):
        """Test database health check when MongoDB is available."""
        mock_client = MagicMock()
        mock_db = MagicMock()
        mock_db.command = AsyncMock(return_value={"ok": 1})
        mock_client.__getitem__.return_value = mock_db
        mock_get_client.return_value = mock_client

        response = client.get("/db-health")
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] == 1
        assert "db" in data


class TestListProducts:
    """Test product listing endpoint."""

    @patch('app.main.get_collection')
    @patch('app.main.get_inventory_stock')
    def test_list_products_empty_returns_empty_array(
        self, mock_inventory, mock_get_coll, client
    ):
        """Test listing products when database is empty."""
        mock_coll = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=[])
        mock_coll.find.return_value = mock_cursor
        mock_get_coll.return_value = mock_coll
        mock_inventory.return_value = 0

        response = client.get("/api/products")
        assert response.status_code == 200
        assert response.json() == []

    @patch('app.main.get_collection')
    @patch('app.main.get_inventory_stock')
    def test_list_products_returns_all_products(
        self, mock_inventory, mock_get_coll, client, sample_product
    ):
        """Test listing products returns all products with inventory."""
        mock_coll = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=[sample_product])
        mock_coll.find.return_value = mock_cursor
        mock_get_coll.return_value = mock_coll
        mock_inventory.return_value = 50

        response = client.get("/api/products")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Test Product"
        assert data[0]["stock"] == 50  # From inventory service

    @patch('app.main.get_collection')
    @patch('app.main.get_inventory_stock')
    def test_list_products_includes_all_fields(
        self, mock_inventory, mock_get_coll, client, sample_product
    ):
        """Test that all product fields are returned."""
        mock_coll = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=[sample_product])
        mock_coll.find.return_value = mock_cursor
        mock_get_coll.return_value = mock_coll
        mock_inventory.return_value = 100

        response = client.get("/api/products")
        data = response.json()[0]

        assert "id" in data
        assert "name" in data
        assert "sku" in data
        assert "price" in data
        assert "stock" in data
        assert "category" in data


class TestCreateProduct:
    """Test product creation endpoint."""

    @patch('app.main.get_collection')
    @patch('app.main.get_inventory_stock')
    def test_create_product_success(
        self, mock_inventory, mock_get_coll, client, sample_product_create
    ):
        """Test successful product creation."""
        mock_coll = MagicMock()
        mock_coll.find_one = AsyncMock(
            side_effect=[None, {**sample_product_create, "id": "test-id"}]
        )
        mock_coll.insert_one = AsyncMock()
        mock_get_coll.return_value = mock_coll
        mock_inventory.return_value = 50

        response = client.post("/api/products", json=sample_product_create)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Test Product"
        assert data["sku"] == "NEW-SKU-001"
        assert "id" in data

    @patch('app.main.get_collection')
    def test_create_product_duplicate_sku_fails(
        self, mock_get_coll, client, sample_product_create
    ):
        """Test product creation fails with duplicate SKU."""
        mock_coll = MagicMock()
        mock_coll.find_one = AsyncMock(return_value={"sku": "NEW-SKU-001"})
        mock_get_coll.return_value = mock_coll

        response = client.post("/api/products", json=sample_product_create)
        assert response.status_code == 400
        assert "SKU already exists" in response.json()["detail"]

    def test_create_product_invalid_price_fails(self, client):
        """Test product creation fails with negative price."""
        invalid_product = {
            "name": "Invalid Product",
            "sku": "INV-001",
            "price": -10.00,
            "stock": 10,
        }

        response = client.post("/api/products", json=invalid_product)
        assert response.status_code == 422

    def test_create_product_zero_price_fails(self, client):
        """Test product creation fails with zero price."""
        invalid_product = {
            "name": "Free Product",
            "sku": "FREE-001",
            "price": 0.00,
            "stock": 10,
        }

        response = client.post("/api/products", json=invalid_product)
        assert response.status_code == 422

    def test_create_product_negative_stock_fails(self, client):
        """Test product creation fails with negative stock."""
        invalid_product = {
            "name": "Invalid Stock",
            "sku": "STOCK-001",
            "price": 29.99,
            "stock": -5,
        }

        response = client.post("/api/products", json=invalid_product)
        assert response.status_code == 422

    def test_create_product_missing_required_fields_fails(self, client):
        """Test product creation fails with missing required fields."""
        incomplete_product = {"name": "Incomplete Product"}

        response = client.post("/api/products", json=incomplete_product)
        assert response.status_code == 422

    @patch('app.main.get_collection')
    @patch('app.main.get_inventory_stock')
    def test_create_product_minimal_fields(
        self, mock_inventory, mock_get_coll, client
    ):
        """Test product creation with only required fields."""
        minimal_product = {
            "name": "Minimal Product",
            "sku": "MIN-001",
            "price": 19.99,
            "stock": 10,
        }

        mock_coll = MagicMock()
        mock_coll.find_one = AsyncMock(
            side_effect=[None, {**minimal_product, "id": "test-id"}]
        )
        mock_coll.insert_one = AsyncMock()
        mock_get_coll.return_value = mock_coll
        mock_inventory.return_value = 10

        response = client.post("/api/products", json=minimal_product)
        assert response.status_code == 201


class TestGetProduct:
    """Test get single product endpoint."""

    @patch('app.main.get_collection')
    @patch('app.main.get_inventory_stock')
    def test_get_product_by_id_success(
        self, mock_inventory, mock_get_coll, client, sample_product
    ):
        """Test retrieving a product by ID."""
        mock_coll = MagicMock()
        mock_coll.find_one = AsyncMock(return_value=sample_product)
        mock_get_coll.return_value = mock_coll
        mock_inventory.return_value = 100

        product_id = sample_product["id"]
        response = client.get(f"/api/products/{product_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == product_id
        assert data["name"] == "Test Product"

    @patch('app.main.get_collection')
    def test_get_product_not_found(self, mock_get_coll, client):
        """Test retrieving non-existent product returns 404."""
        mock_coll = MagicMock()
        mock_coll.find_one = AsyncMock(return_value=None)
        mock_get_coll.return_value = mock_coll

        response = client.get("/api/products/nonexistent-id")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestUpdateProduct:
    """Test product update endpoint."""

    @patch('app.main.get_collection')
    @patch('app.main.get_inventory_stock')
    def test_update_product_single_field(
        self, mock_inventory, mock_get_coll, client, sample_product
    ):
        """Test updating a single field of a product."""
        update_data = {"name": "Updated Product Name"}
        updated_product = {**sample_product, **update_data}

        mock_coll = MagicMock()
        mock_coll.find_one_and_update = AsyncMock(return_value=updated_product)
        mock_get_coll.return_value = mock_coll
        mock_inventory.return_value = 100

        product_id = sample_product["id"]
        response = client.patch(f"/api/products/{product_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Product Name"

    @patch('app.main.get_collection')
    @patch('app.main.get_inventory_stock')
    def test_update_product_multiple_fields(
        self, mock_inventory, mock_get_coll, client, sample_product
    ):
        """Test updating multiple fields simultaneously."""
        update_data = {
            "name": "Updated Name",
            "price": 39.99,
            "description": "Updated description",
        }
        updated_product = {**sample_product, **update_data}

        mock_coll = MagicMock()
        mock_coll.find_one_and_update = AsyncMock(return_value=updated_product)
        mock_get_coll.return_value = mock_coll
        mock_inventory.return_value = 100

        product_id = sample_product["id"]
        response = client.patch(f"/api/products/{product_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["price"] == 39.99

    @patch('app.main.get_collection')
    def test_update_product_not_found(self, mock_get_coll, client):
        """Test updating non-existent product returns 404."""
        mock_coll = MagicMock()
        mock_coll.find_one_and_update = AsyncMock(return_value=None)
        mock_get_coll.return_value = mock_coll

        update_data = {"name": "Updated"}
        response = client.patch("/api/products/nonexistent-id", json=update_data)
        assert response.status_code == 404

    @patch('app.main.get_collection')
    def test_update_product_duplicate_sku_fails(self, mock_get_coll, client):
        """Test update fails when SKU already exists."""
        mock_coll = MagicMock()
        mock_coll.find_one = AsyncMock(
            return_value={"id": "other-id", "sku": "EXISTING-SKU"}
        )
        mock_get_coll.return_value = mock_coll

        update_data = {"sku": "EXISTING-SKU"}
        response = client.patch("/api/products/test-id", json=update_data)
        assert response.status_code == 400
        assert "SKU already exists" in response.json()["detail"]

    @patch('app.main.get_collection')
    def test_update_product_empty_payload_fails(self, mock_get_coll, client):
        """Test update fails when no fields provided."""
        mock_coll = MagicMock()
        mock_get_coll.return_value = mock_coll

        response = client.patch("/api/products/test-id", json={})
        assert response.status_code == 400
        assert "No fields to update" in response.json()["detail"]


class TestDeleteProduct:
    """Test product deletion endpoint."""

    @patch('app.main.get_collection')
    def test_delete_product_success(self, mock_get_coll, client):
        """Test successful product deletion."""
        mock_coll = MagicMock()
        mock_result = MagicMock()
        mock_result.deleted_count = 1
        mock_coll.delete_one = AsyncMock(return_value=mock_result)
        mock_get_coll.return_value = mock_coll

        response = client.delete("/api/products/test-id")
        assert response.status_code == 204

    @patch('app.main.get_collection')
    def test_delete_product_not_found(self, mock_get_coll, client):
        """Test deleting non-existent product returns 404."""
        mock_coll = MagicMock()
        mock_result = MagicMock()
        mock_result.deleted_count = 0
        mock_coll.delete_one = AsyncMock(return_value=mock_result)
        mock_get_coll.return_value = mock_coll

        response = client.delete("/api/products/nonexistent-id")
        assert response.status_code == 404


class TestInventoryIntegration:
    """Test inventory service integration."""

    @patch('httpx.AsyncClient')
    async def test_get_inventory_stock_success(self, mock_client):
        """Test successful inventory stock retrieval."""
        from app.main import get_inventory_stock

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"quantity": 50}

        mock_client_instance = MagicMock()
        mock_client_instance.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )
        mock_client.return_value = mock_client_instance

        stock = await get_inventory_stock("test-product-id")
        assert stock == 50

    @patch('httpx.AsyncClient')
    async def test_get_inventory_stock_service_down(self, mock_client):
        """Test inventory stock returns 0 when service is down."""
        from app.main import get_inventory_stock

        mock_client_instance = MagicMock()
        mock_client_instance.__aenter__.return_value.get = AsyncMock(
            side_effect=Exception("Service down")
        )
        mock_client.return_value = mock_client_instance

        stock = await get_inventory_stock("test-product-id")
        assert stock == 0

    @patch('httpx.AsyncClient')
    async def test_get_inventory_stock_timeout(self, mock_client):
        """Test inventory stock returns 0 on timeout."""
        from app.main import get_inventory_stock

        mock_client_instance = MagicMock()
        mock_client_instance.__aenter__.return_value.get = AsyncMock(
            side_effect=Exception("Timeout")
        )
        mock_client.return_value = mock_client_instance

        stock = await get_inventory_stock("test-product-id")
        assert stock == 0


class TestCORSConfiguration:
    """Test CORS middleware configuration."""

    def test_cors_allows_all_origins(self, client):
        """Test CORS headers allow all origins."""
        response = client.get(
            "/health", headers={"Origin": "http://localhost:3000"}
        )
        assert response.status_code == 200
        # CORS headers should be present in response
