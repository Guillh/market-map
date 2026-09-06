# Market Map

Market Map is a portfolio project for mapping store and warehouse layouts, shelves, subdivisions, and product locations.

## Phase 1

This repository currently focuses on the backend foundation:

- Spring Boot backend with Java 21
- PostgreSQL through Docker Compose
- Flyway configured as the database migration tool
- Hibernate configured with `ddl-auto=validate`
- `GET /api/health` endpoint for a simple service health check
- Initial package organization for future domains

The product, store, layout, inventory, authentication, and visual map editor features are intentionally left for later phases.

## Running Locally

From the repository root:

```bash
docker compose up --build
```

Then check:

```bash
curl http://localhost:8080/api/health
```

Expected response shape:

```json
{
  "status": "UP",
  "timestamp": "2026-09-06T00:00:00Z"
}
```
