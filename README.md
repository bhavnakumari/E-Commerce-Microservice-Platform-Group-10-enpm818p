# 🛍️ E-Commerce on EKS — Polyglot Microservices Architecture

A cloud-native e-commerce application built with **FastAPI (Python)** and **Spring Boot (Java)** microservices, deployed on **AWS Elastic Kubernetes Service (EKS)**.  
This project demonstrates scalable microservices, CI/CD, monitoring, secrets management, and mixed database usage (**MySQL**, **MongoDB**, and **Redis**).

---

## 🧩 Architecture Summary

| Service | Tech Stack | Database | Purpose |
|----------|-------------|-----------|----------|
| **Storefront** | React + NGINX | — | User-facing storefront SPA |
| **Users Service** | Java Spring Boot | MySQL + Redis | Registration, login, JWT auth |
| **Products Service** | Python FastAPI | MongoDB + Redis | Product catalog and caching |
| **Inventory Service** | Python FastAPI | MongoDB | Stock levels, low-stock alerts |
| **Orders Service** | Java Spring Boot | MySQL + Redis Streams | Checkout and order lifecycle |
| **Payments Service** | Java Spring Boot | MySQL + Redis Streams | Payment simulation & confirmations |
| **Notifications Worker** | Python | Redis Streams | Consumes events, sends emails/SMS |

---

## 🗄️ Databases & Infrastructure

| Component | Purpose |
|------------|----------|
| **AWS RDS (MySQL)** | Orders, Payments, Users |
| **MongoDB Atlas / StatefulSet** | Products & Inventory |
| **Redis (ElastiCache)** | Caching, sessions, Redis Streams for async events |
| **Ingress Controller (ALB)** | Path-based routing |
| **External Secrets Operator + AWS Secrets Manager** | Securely manage secrets |
| **Prometheus + Grafana + CloudWatch** | Monitoring, dashboards, and logs |

---

## Architecture Diagram

<img width="1796" height="572" alt="image" src="https://github.com/user-attachments/assets/9ad38bf6-a4db-4ef9-beff-e3a3176d26e8" />
