@startuml
!theme plain
skinparam shadowing false
skinparam componentStyle rectangle
title E-Commerce on EKS (Polyglot Microservices + Mixed Datastores)

actor User
rectangle "AWS ALB (Ingress)" as ALB

package "AWS VPC (2+ AZs)" {
  package "EKS Cluster" {
    [Storefront (React+NGINX)]
    [Products (FastAPI)]
    [Orders (Spring Boot)]
    [Inventory (FastAPI)]
    [Payments (Spring Boot)]
    [Users (Spring Boot)]
    [Notifications Worker (Python)]
    [Prometheus]
    [Grafana]
  }

  cloud "ElastiCache Redis\n(Cache + Streams)" as REDIS
  database "RDS MySQL\n(Users, Orders, Payments)" as MYSQL
  database "MongoDB\n(Products, Inventory)" as MONGO
}

User --> ALB : HTTPS
ALB --> [Storefront (React+NGINX)]
ALB --> [Products (FastAPI)]
ALB --> [Orders (Spring Boot)]
ALB --> [Users (Spring Boot)]
ALB --> [Payments (Spring Boot)]

[Products (FastAPI)] --> MONGO
[Inventory (FastAPI)] --> MONGO
[Users (Spring Boot)] --> MYSQL
[Orders (Spring Boot)] --> MYSQL
[Payments (Spring Boot)] --> MYSQL

' Caching & sessions
[Products (FastAPI)] ..> REDIS : cache hot lists
[Users (Spring Boot)] ..> REDIS : sessions/rate limit

' Eventing via Redis Streams
[Orders (Spring Boot)] -[#blue]-> REDIS : XADD order_placed
[Payments (Spring Boot)] -[#blue]-> REDIS : XADD payment_succeeded
[Inventory (FastAPI)] -[#blue]-> REDIS : XREAD order_placed
[Notifications Worker (Python)] -[#blue]-> REDIS : XREAD order_placed, payment_succeeded
@enduml