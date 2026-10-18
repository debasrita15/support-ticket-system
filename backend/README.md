# ☕ Support Ticket System - Spring Boot Backend

The core application backend built with **Java 21** and **Spring Boot 3.5.0**.

---

## 🛠️ Tech Stack & Dependencies

- **Java 21 (LTS)**
- **Spring Boot 3.5.0**
  - `spring-boot-starter-web`: REST API controllers and JSON serialization
  - `spring-boot-starter-data-jpa`: Object-Relational Mapping (Hibernate)
  - `spring-boot-starter-security`: Stateless authentication filter chain
  - `spring-boot-starter-validation`: Jakarta Bean Validation
- **PostgreSQL JDBC Driver**
- **JJWT 0.12.6**: JSON Web Token generation, parsing, and cryptographic verification
- **BCrypt**: Password hashing

---

## 🏃 Running Locally

```bash
# Verify database connection in application.properties
# Then start the server:
.\mvnw.cmd spring-boot:run
```

- Port: `8080`
- Health check: `GET http://localhost:8080/api/hello`
- Verify token: `GET http://localhost:8080/api/me` (requires Bearer token)

---

## 🔒 Security Configuration

- `SecurityConfig.java`:
  - Disables CSRF (stateless API).
  - Configures CORS for `http://localhost:4200`.
  - Permits `/api/auth/**`, `/api/hello`, and `/error`.
  - Enforces JWT authentication on all other endpoints.
  - Injects `JwtAuthFilter` into the filter chain.
