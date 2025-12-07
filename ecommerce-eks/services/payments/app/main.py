import uuid
import time
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, constr
from prometheus_client import Histogram, Counter, generate_latest, CONTENT_TYPE_LATEST

app = FastAPI(
    root_path="/inventory",
    title="Payment Service",
    version="0.1.0",
    description="Static payment microservice with a single test card.",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEST_CARD = "4242424242424242"

# 🔹 Prometheus metrics (define BEFORE middleware so names exist)
http_request_duration = Histogram(
    "http_server_requests_seconds",
    "HTTP server request duration in seconds",
    ["method", "uri", "status"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
)

http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "uri", "status"],
)


class PaymentRequest(BaseModel):
    userId: int = Field(..., example=1)
    amount: float = Field(..., gt=0, example=49.99)
    currency: str = Field("USD", example="USD")
    cardNumber: constr(strip_whitespace=True, min_length=13, max_length=19) = Field(
        ..., example="4242424242424242"
    )
    expiryMonth: int = Field(..., ge=1, le=12, example=12)
    expiryYear: int = Field(..., ge=2024, example=2030)
    cvv: constr(strip_whitespace=True, min_length=3, max_length=4) = Field(
        ..., example="123"
    )


class PaymentResponse(BaseModel):
    status: str = Field(..., example="APPROVED")  # or DECLINED
    transactionId: str = Field(..., example="pay_123456")
    reason: str | None = Field(None, example="Test card approved")


@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    start = time.perf_counter()

    response = await call_next(request)

    latency = time.perf_counter() - start
    labels = {
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


@app.get("/health")
async def health():
    return {"status": "ok", "service": "payments"}


@app.post("/api/payments/charge", response_model=PaymentResponse)
async def charge(request: PaymentRequest):
    """
    Static payment logic:
    - If cardNumber == 4242424242424242 -> APPROVED
    - Else -> DECLINED
    """
    tx_id = f"pay_{uuid.uuid4().hex[:12]}"

    if request.cardNumber == TEST_CARD:
        return PaymentResponse(
            status="APPROVED",
            transactionId=tx_id,
            reason="Test card approved",
        )
    else:
        return PaymentResponse(
            status="DECLINED",
            transactionId=tx_id,
            reason="Card declined by static rules",
        )