# Contributing to E-Commerce Microservices Platform

Thank you for your interest in contributing to our E-Commerce Microservices Platform! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

- Be respectful and inclusive in all interactions
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/E-Commerce-Microservice-Platform-Group-10-enpm818R.git
   cd E-Commerce-Microservice-Platform-Group-10-enpm818R
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/E-Commerce-Microservice-Platform-Group-10-enpm818R.git
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Environment Setup

### Prerequisites

- **Docker** and **Docker Compose** (required)
- **Java 17+** and **Maven** (for Java services)
- **Python 3.12+** (for Python services)
- **Node.js 18+** and **npm** (for Storefront)
- **kubectl** (for Kubernetes deployment)
- **AWS CLI** (for EKS deployment)

### Local Development Setup

1. **Build Java services**:
   ```bash
   cd ecommerce-eks/services/users-java
   mvn clean package -DskipTests

   cd ../orders-java
   mvn clean package -DskipTests
   ```

2. **Start all services with Docker Compose**:
   ```bash
   cd ecommerce-eks
   docker compose up --build
   ```

3. **Verify services are running**:
   ```bash
   curl http://localhost:8083/api/users/health
   curl http://localhost:8001/health
   curl http://localhost:8002/health
   curl http://localhost:8003/health
   curl http://localhost:8084/health
   ```

## Project Structure

```
.
├── ecommerce-eks/
│   ├── services/
│   │   ├── users-java/          # Java Spring Boot - User management
│   │   ├── orders-java/         # Java Spring Boot - Order processing
│   │   ├── products-fastapi/    # Python FastAPI - Product catalog
│   │   ├── inventory-fastapi/   # Python FastAPI - Inventory management
│   │   ├── payments-fastapi/    # Python FastAPI - Payment processing
│   │   └── notifications-worker/ # Python - Event consumer
│   ├── storefront/              # React frontend
│   ├── k8s/                     # Kubernetes manifests
│   └── docker-compose.yml       # Local development setup
└── .github/
    ├── workflows/               # CI/CD pipelines
    └── ISSUE_TEMPLATE/         # Issue templates
```

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow the existing code style in each service
- Add comments for complex logic
- Keep functions small and focused
- Avoid code duplication

### Java (Spring Boot)

- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use meaningful variable and method names
- Use Spring Boot best practices
- Add Javadoc for public methods
- Use proper exception handling

**Example:**
```java
@Service
public class UserService {

    /**
     * Registers a new user in the system.
     * @param userRequest the user registration details
     * @return the created user
     * @throws UserAlreadyExistsException if user already exists
     */
    public User registerUser(UserRequest userRequest) {
        // Implementation
    }
}
```

### Python (FastAPI)

- Follow [PEP 8](https://pep8.org/) style guide
- Use type hints for function parameters and return values
- Use descriptive variable names
- Add docstrings for functions and classes
- Use async/await appropriately

**Example:**
```python
from fastapi import FastAPI, HTTPException
from typing import List

@app.post("/products", response_model=Product)
async def create_product(product: ProductCreate) -> Product:
    """
    Create a new product in the catalog.

    Args:
        product: Product creation details

    Returns:
        The created product

    Raises:
        HTTPException: If product creation fails
    """
    # Implementation
```

### JavaScript/React (Storefront)

- Use ES6+ features
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks
- Use meaningful component and variable names
- Add PropTypes or TypeScript types

### Kubernetes/YAML

- Use consistent indentation (2 spaces)
- Add descriptive labels and annotations
- Include resource limits and requests
- Use namespaces appropriately
- Document complex configurations with comments

## Testing Guidelines

### Unit Tests

- Write unit tests for all new features
- Maintain or improve code coverage
- Test edge cases and error conditions

**Java (JUnit 5):**
```bash
cd ecommerce-eks/services/users-java
mvn test
```

**Python (pytest):**
```bash
cd ecommerce-eks/services/products-fastapi
pytest tests/
```

### Integration Tests

- Test service interactions
- Test database operations
- Test API endpoints end-to-end

### Manual Testing

- Test in local Docker environment before submitting PR
- Verify all affected services work correctly
- Test both happy paths and error scenarios

## Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples

```
feat(products): add search functionality to product catalog

Add full-text search capability using MongoDB text indexes.
Includes filtering by category and price range.

Closes #123
```

```
fix(orders): resolve race condition in order processing

Implement proper locking mechanism to prevent duplicate orders
when multiple requests arrive simultaneously.

Fixes #456
```

## Pull Request Process

1. **Update your branch** with the latest changes from upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure all tests pass**:
   - Run unit tests locally
   - Test in Docker environment
   - Verify CI/CD pipeline passes

3. **Update documentation** if needed:
   - Update README.md for new features
   - Add/update API documentation
   - Update architecture diagrams if applicable

4. **Create a Pull Request**:
   - Use a clear, descriptive title
   - Fill out the PR template completely
   - Link related issues
   - Add screenshots for UI changes
   - Request review from relevant code owners

5. **Address review comments**:
   - Respond to all review feedback
   - Make requested changes promptly
   - Push updates to your branch

6. **Merge requirements**:
   - At least one approval from a code owner
   - All CI/CD checks must pass
   - No merge conflicts with main branch
   - Documentation updated if needed

## Issue Reporting

### Before Creating an Issue

- Search existing issues to avoid duplicates
- Verify the issue in the latest version
- Gather relevant information (logs, screenshots, environment details)

### Creating an Issue

- Use appropriate issue template (Bug Report or Feature Request)
- Provide clear, detailed description
- Include steps to reproduce for bugs
- Specify affected services
- Add relevant labels

## Database Changes

If your contribution involves database changes:

1. **Create migration scripts** for MySQL changes
2. **Document schema changes** in the PR description
3. **Ensure backward compatibility** when possible
4. **Test migrations** in local environment
5. **Update seed data** if necessary

## Security Guidelines

- Never commit secrets, API keys, or credentials
- Use AWS Secrets Manager for sensitive data
- Follow OWASP security best practices
- Report security vulnerabilities privately
- Validate all user inputs
- Use parameterized queries to prevent SQL injection

## Monitoring and Logging

- Add appropriate logging for new features
- Use consistent log levels (DEBUG, INFO, WARN, ERROR)
- Include relevant context in log messages
- Add Prometheus metrics for new endpoints
- Update Grafana dashboards if needed

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search closed issues and PRs
3. Open a discussion or issue
4. Reach out to maintainers

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to our E-Commerce Microservices Platform!
