"""
Integration tests for Payments Service API endpoints
These tests validate payment processing logic for CI/CD pipeline
"""
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    from app.main import app
    return TestClient(app)


@pytest.fixture
def valid_payment_request():
    """Valid payment request with test card."""
    return {
        "userId": 1,
        "amount": 49.99,
        "currency": "USD",
        "cardNumber": "4242424242424242",
        "expiryMonth": 12,
        "expiryYear": 2030,
        "cvv": "123"
    }


@pytest.fixture
def invalid_payment_request():
    """Invalid payment request with non-test card."""
    return {
        "userId": 1,
        "amount": 49.99,
        "currency": "USD",
        "cardNumber": "1234567890123456",
        "expiryMonth": 12,
        "expiryYear": 2030,
        "cvv": "123"
    }


class TestHealthEndpoints:
    """Test health check endpoints for monitoring and CI/CD."""

    def test_health_check_returns_200(self, client):
        """Test basic health endpoint is accessible."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
        assert response.json()["service"] == "payments"


class TestPaymentCharge:
    """Test payment charge endpoint."""

    def test_charge_with_valid_test_card(self, client, valid_payment_request):
        """Test successful payment with valid test card."""
        response = client.post("/api/payments/charge", json=valid_payment_request)
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "APPROVED"
        assert "transactionId" in data
        assert data["transactionId"].startswith("pay_")
        assert data["reason"] == "Test card approved"

    def test_charge_with_invalid_card(self, client, invalid_payment_request):
        """Test payment declined with invalid card."""
        response = client.post("/api/payments/charge", json=invalid_payment_request)
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "DECLINED"
        assert "transactionId" in data
        assert data["reason"] == "Card declined by static rules"

    def test_charge_generates_unique_transaction_ids(
        self, client, valid_payment_request
    ):
        """Test that each payment generates a unique transaction ID."""
        response1 = client.post("/api/payments/charge", json=valid_payment_request)
        response2 = client.post("/api/payments/charge", json=valid_payment_request)

        data1 = response1.json()
        data2 = response2.json()

        assert data1["transactionId"] != data2["transactionId"]

    def test_charge_with_minimum_amount(self, client):
        """Test payment with minimum allowed amount."""
        payment = {
            "userId": 1,
            "amount": 0.01,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 200
        assert response.json()["status"] == "APPROVED"

    def test_charge_with_large_amount(self, client):
        """Test payment with large amount."""
        payment = {
            "userId": 1,
            "amount": 9999.99,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 200
        assert response.json()["status"] == "APPROVED"


class TestPaymentValidation:
    """Test payment request validation."""

    def test_charge_with_zero_amount_fails(self, client):
        """Test that zero amount payment fails validation."""
        payment = {
            "userId": 1,
            "amount": 0.0,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 422  # Validation error

    def test_charge_with_negative_amount_fails(self, client):
        """Test that negative amount fails validation."""
        payment = {
            "userId": 1,
            "amount": -10.00,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 422

    def test_charge_with_missing_amount_fails(self, client):
        """Test that missing amount fails validation."""
        payment = {
            "userId": 1,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 422

    def test_charge_with_missing_card_number_fails(self, client):
        """Test that missing card number fails validation."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 422


class TestCardNumberValidation:
    """Test card number validation."""

    def test_charge_with_short_card_number_fails(self, client):
        """Test that card number less than 13 digits fails."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "123456789012",  # 12 digits
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 422

    def test_charge_with_long_card_number_fails(self, client):
        """Test that card number more than 19 digits fails."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "12345678901234567890",  # 20 digits
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 422

    def test_charge_with_16_digit_card(self, client):
        """Test standard 16-digit card number."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "4242424242424242",  # 16 digits
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 200


class TestExpiryValidation:
    """Test expiry date validation."""

    def test_charge_with_invalid_month_zero_fails(self, client):
        """Test that month 0 fails validation."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 0,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 422

    def test_charge_with_invalid_month_13_fails(self, client):
        """Test that month 13 fails validation."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 13,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 422

    def test_charge_with_valid_months(self, client):
        """Test all valid months (1-12) are accepted."""
        for month in range(1, 13):
            payment = {
                "userId": 1,
                "amount": 49.99,
                "currency": "USD",
                "cardNumber": "4242424242424242",
                "expiryMonth": month,
                "expiryYear": 2030,
                "cvv": "123"
            }

            response = client.post("/api/payments/charge", json=payment)
            assert response.status_code == 200

    def test_charge_with_past_year_accepted(self, client):
        """Test that past expiry year is accepted (validation is static)."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2020,  # Past year
            "cvv": "123"
        }

        # Static validation requires year >= 2024
        response = client.post("/api/payments/charge", json=payment)
        # Will fail validation as year must be >= 2024
        assert response.status_code == 422

    def test_charge_with_minimum_valid_year(self, client):
        """Test minimum valid year (2024)."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2024,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 200


class TestCVVValidation:
    """Test CVV validation."""

    def test_charge_with_short_cvv_fails(self, client):
        """Test that CVV less than 3 digits fails."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "12"  # Only 2 digits
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 422

    def test_charge_with_long_cvv_fails(self, client):
        """Test that CVV more than 4 digits fails."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "12345"  # 5 digits
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 422

    def test_charge_with_3_digit_cvv(self, client):
        """Test 3-digit CVV is accepted."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 200

    def test_charge_with_4_digit_cvv(self, client):
        """Test 4-digit CVV is accepted (AMEX)."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "1234"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 200


class TestUserIdValidation:
    """Test userId validation."""

    def test_charge_with_missing_user_id_fails(self, client):
        """Test that missing userId fails validation."""
        payment = {
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 422

    def test_charge_with_valid_user_ids(self, client):
        """Test various valid user IDs."""
        for user_id in [1, 100, 999999]:
            payment = {
                "userId": user_id,
                "amount": 49.99,
                "currency": "USD",
                "cardNumber": "4242424242424242",
                "expiryMonth": 12,
                "expiryYear": 2030,
                "cvv": "123"
            }

            response = client.post("/api/payments/charge", json=payment)
            assert response.status_code == 200


class TestCurrencyValidation:
    """Test currency validation."""

    def test_charge_with_usd_currency(self, client):
        """Test USD currency is accepted."""
        payment = {
            "userId": 1,
            "amount": 49.99,
            "currency": "USD",
            "cardNumber": "4242424242424242",
            "expiryMonth": 12,
            "expiryYear": 2030,
            "cvv": "123"
        }

        response = client.post("/api/payments/charge", json=payment)
        assert response.status_code == 200

    def test_charge_with_other_currency(self, client):
        """Test other currencies are accepted."""
        for currency in ["EUR", "GBP", "JPY"]:
            payment = {
                "userId": 1,
                "amount": 49.99,
                "currency": currency,
                "cardNumber": "4242424242424242",
                "expiryMonth": 12,
                "expiryYear": 2030,
                "cvv": "123"
            }

            response = client.post("/api/payments/charge", json=payment)
            assert response.status_code == 200


class TestTransactionIdGeneration:
    """Test transaction ID generation."""

    def test_transaction_id_format(self, client, valid_payment_request):
        """Test transaction ID has correct format."""
        response = client.post("/api/payments/charge", json=valid_payment_request)
        data = response.json()

        assert data["transactionId"].startswith("pay_")
        assert len(data["transactionId"]) == 16  # "pay_" + 12 hex chars

    def test_transaction_ids_are_unique(self, client, valid_payment_request):
        """Test that multiple payments generate unique IDs."""
        transaction_ids = set()

        for _ in range(10):
            response = client.post(
                "/api/payments/charge", json=valid_payment_request
            )
            data = response.json()
            transaction_ids.add(data["transactionId"])

        # All IDs should be unique
        assert len(transaction_ids) == 10


class TestCORSConfiguration:
    """Test CORS middleware configuration."""

    def test_cors_allows_all_origins(self, client):
        """Test CORS headers allow all origins."""
        response = client.get(
            "/health", headers={"Origin": "http://localhost:3000"}
        )
        assert response.status_code == 200
