# E-Commerce on EKS — Polyglot Microservices Architecture

A cloud-native e-commerce application built with **FastAPI (Python)** and **Spring Boot (Java)** microservices, deployed on **AWS Elastic Kubernetes Service (EKS)**.  
This project demonstrates scalable microservices, CI/CD, monitoring, secrets management, and mixed database usage (**MySQL**, **MongoDB**, and **Redis**).

---

## Architecture Summary

| Service | Tech Stack | Database | Purpose |
|----------|-------------|-----------|----------|
| **Storefront** | React + NGINX | — | User-facing storefront SPA |
| **Users Service** | Java Spring Boot | MySQL + Redis | Registration, login, JWT auth |
| **Products Service** | Python FastAPI | MongoDB + Redis | Product catalog and caching |
| **Inventory Service** | Python FastAPI | MongoDB | Stock levels, low-stock alerts |
| **Orders Service** | Java Spring Boot | MySQL + Redis Streams | Checkout and order lifecycle |
| **Payments Service** | Python FastAPI | - | Payment simulation & confirmations |
| **Notifications Worker** | Python | Redis Streams | Consumes events, sends emails/SMS |

---

## Databases & Infrastructure

| Component | Purpose |
|------------|----------|
| **AWS RDS (MySQL)** | Orders, Users |
| **MongoDB Atlas / StatefulSet** | Products & Inventory |
| **Redis (ElastiCache)** | Caching, sessions, Redis Streams for async events |
| **Ingress Controller (ALB)** | Path-based routing |
| **External Secrets Operator + AWS Secrets Manager** | Securely manage secrets |
| **Prometheus + Grafana + CloudWatch** | Monitoring, dashboards, and logs |

---

## Architecture Diagram

<img width="1796" height="572" alt="image" src="https://github.com/user-attachments/assets/9ad38bf6-a4db-4ef9-beff-e3a3176d26e8" />
---

## 🔐 Test Card Rules (Payments Service)

For demo purposes, the **Payments** microservice uses a static test card:

- ✅ **APPROVED:** `4242 4242 4242 4242`
- ❌ Any other card → `DECLINED`

---

## 🔄 End-to-End Order Flow

1. 👤 **User registers** with email, password, and shipping address (Users → MySQL)  
2. 🛍️ **Products** are created (Products → MongoDB)  
3. 📦 **Inventory** is set for each product (Inventory → Redis)  
4. 🧾 **Order is placed** (Orders service):
   - Fetches user + shipping address from Users
   - Charges Payment service (test card)
   - Checks & decrements stock via Inventory
   - Stores order + **address snapshot** in MySQL
5. 🔍 Order details can be fetched with full `shippingAddress` included

---

## ⚙️ How to Run Locally

### 1. ✅ Prerequisites

- Docker & Docker Compose installed
- Java 17 + Maven (for local JAR builds)
- Python 3.12+ (optional; not required if you only use Docker)

### 2. 🏗 Build Java Microservices

From repo root:

```bash
cd ecommerce-eks/services/users-java
mvn clean package -DskipTests

cd ../orders-java
mvn clean package -DskipTests
```
### 🐳 Start All Services with Docker Compose

From ecommerce-eks:
```bash
cd ecommerce-eks
docker compose up --build

```
Services will be available at:
   - Users - http://localhost:8083
   - Products- http://localhost:8001
   - Inventory - http://localhost:8002
   - Payments - http://localhost:8003
   - Orders - http://localhost:8084

### Basic Health Checks
```bash
curl http://localhost:8083/api/users/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8084/health
```







