import uuid
import time
import logging
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, constr
from prometheus_client import Histogram, Counter, generate_latest, CONTENT_TYPE_LATEST

# -------------------------------
# Logging Setup
# -------------------------------
logger = logging.getLogger("payments-service")
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "%(asctime)s %(levelname)s [%(name)s] %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

logger.info("Starting Payments Service...")

# -------------------------------
# FastAPI App
# -------------------------------
app = FastAPI(
    root_path="/inventory",
    title="Payment Service",
    version="0.1.0",
    description="Static payment microservice with a single approved test card.",
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

# -------------------------------
# Prometheus Metrics
# -------------------------------
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


# -------------------------------
# Middleware
# -------------------------------
@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    path = request.url.path
    method = request.method

    logger.info("Incoming request %s %s", method, path)
    start = time.perf_counter()

    try:
        response = await call_next(request)
    except Exception as e:
        logger.exception("Unhandled error during %s %s: %r", method, path, e)
        raise

    latency = time.perf_counter() - start
    status = response.status_code

    labels = {
        "service": "payments-service",
        "method": method,
        "uri": path,
        "status": str(status),
    }

    http_request_duration.labels(**labels).observe(latency)
    http_requests_total.labels(**labels).inc()

    logger.info(
        "Completed request %s %s -> %s in %.4f seconds",
        method, path, status, latency
    )

    return response


# -------------------------------
# Models
# -------------------------------
class PaymentRequest(BaseModel):
    userId: int
    amount: float = Field(..., gt=0)
    currency: str = "USD"
    cardNumber: constr(strip_whitespace=True, min_length=13, max_length=19)
    expiryMonth: int = Field(..., ge=1, le=12)
    expiryYear: int = Field(..., ge=2024)
    cvv: constr(strip_whitespace=True, min_length=3, max_length=4)


class PaymentResponse(BaseModel):
    status: str
    transactionId: str
    reason: str | None = None


# -------------------------------
# Endpoints
# -------------------------------
@app.get("/metrics")
def metrics() -> Response:
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/health")
async def health():
    logger.info("Payments health check called")
    return {"status": "ok", "service": "payments"}


@app.post("/api/payments/charge", response_model=PaymentResponse)
async def charge(request: PaymentRequest):
    """
    Static payment logic:
    Approve only if TEST_CARD is used.
    """
    logger.info(
        "Payment charge request received userId=%s amount=%s currency=%s",
        request.userId, request.amount, request.currency
    )

    tx_id = f"pay_{uuid.uuid4().hex[:12]}"

    # APPROVED card
    if request.cardNumber == TEST_CARD:
        logger.info(
            "Payment APPROVED userId=%s amount=%s transactionId=%s",
            request.userId, request.amount, tx_id
        )
        return PaymentResponse(
            status="APPROVED",
            transactionId=tx_id,
            reason="Test card approved",
        )

    # DECLINED
    logger.warning(
        "Payment DECLINED userId=%s amount=%s cardEnding=%s transactionId=%s",
        request.userId,
        request.amount,
        request.cardNumber[-4:],   # last 4 digits
        tx_id,
    )

    return PaymentResponse(
        status="DECLINED",
        transactionId=tx_id,
        reason="Card declined by static rules",
    )