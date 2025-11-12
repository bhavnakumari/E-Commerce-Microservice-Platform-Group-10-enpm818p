# E-Commerce-Microservice-Platform-Group-10-enpm818p (Python microservices + React)

### Group Project for the course "Virtualisation and Containerisation Technologies"
### Monorepo for EKS-based microservices: 
- Products
- Orders
- Inventory
- Payments
- Notifications-worker
- React storefront

## Structure
- `infra/` – EKS cluster & platform bootstrapping
- `k8s/` – Kubernetes manifests (base + overlays)
- `platform/` – Monitoring, external secrets, etc.
- `services/` – Microservices (FastAPI) + storefront
- `.github/workflows/` – CI/CD pipelines
- `docs/` – Diagrams, evidence, runbooks
