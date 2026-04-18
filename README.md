# Ecommerce Platform — Backend Microservices

Backend de e-commerce con arquitectura de microservicios usando NestJS, PostgreSQL y Docker.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      Cliente / Browser                       │
└────────────────────────┬────────────────────────────────────┘
                         │ :8080
                         ▼
              ┌──────────────────────┐
              │   Nginx API Gateway  │
              └──────┬───────────────┘
                     │
     ┌───────────────┼────────────────┐
     │               │                │
     ▼               ▼                ▼
┌──────────┐  ┌─────────────┐  ┌──────────────┐
│  auth-   │  │  products-  │  │   orders-    │
│ service  │  │   service   │◄─│   service    │
│  :3000   │  │    :3001    │  │    :3002     │
│(NestJS/TS│  │ (NestJS/TS) │  │ (NestJS/TS) │
└────┬─────┘  └──────┬──────┘  └──────┬───────┘
     │               │                │
     └───────────────┴────────────────┘
                     ▼
         ┌──────────────────────┐
         │  PostgreSQL 15       │
         │  :5432               │
         │  ┌────────────────┐  │
         │  │ schema:auth    │  │
         │  ├────────────────┤  │
         │  │ schema:products│  │
         │  ├────────────────┤  │
         │  │ schema:orders  │  │
         │  └────────────────┘  │
         └──────────────────────┘
```

---

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) >= 24
- [Docker Compose](https://docs.docker.com/compose/) >= 2.20

---

## Instalación y ejecución

```bash
git clone https://github.com/crifero/ecommerce-backend.git
cd ecommerce-backend
docker-compose up --build
```

Los servicios estarán disponibles en:

| URL                                   | Descripción          |
| ------------------------------------- | -------------------- |
| http://localhost:8080/api/v1/auth     | REST API auth        |
| http://localhost:8080/api/v1/products | REST API productos   |
| http://localhost:8080/api/v1/orders   | REST API órdenes     |
| http://localhost:8080/auth/docs       | Swagger auth         |
| http://localhost:8080/products/docs   | Swagger productos    |
| http://localhost:8080/orders/docs     | Swagger órdenes      |
| http://localhost:8080/health          | Health check gateway |
| http://localhost:3000/api/v1/auth     | Auth (directo)       |
| http://localhost:3001/api/v1/products | Productos (directo)  |
| http://localhost:3002/api/v1/orders   | Órdenes (directo)    |

---

### Formato de respuesta

Todas las respuestas exitosas están envueltas:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Errores:

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/products/123"
}
```

---

## CI/CD

GitHub Actions en `.github/workflows/ci.yml` ejecuta sobre push/PR a `main`:

1. `install` → `npm ci`
2. `lint` → `npm run lint`
3. `build` → `npm run build`
4. `test` → `npm run test`
5. `release` (solo push a main) → bump patch version + genera CHANGELOG.md
6. `simulate-deploy` → simula docker build
