# Evidence Checklist
- [ ] `kubectl get nodes -o wide` (multi-AZ)
- [ ] ALB Ingress → Targets Healthy
- [ ] HPA scales a service
- [ ] Grafana dashboards: latency, error rate, CPU/mem
- [ ] CI (PR) + CD (main) runs
- [ ] ECR images with tags/SHAs
- [ ] ExternalSecret synced from AWS Secrets Manager
- [ ] NetworkPolicies in effect