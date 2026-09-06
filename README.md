# Market Map

Market Map is a portfolio project for mapping store and warehouse layouts, shelves, subdivisions, and product locations.

## Current Stack

- Java 21
- Spring Boot REST API
- PostgreSQL
- Flyway migrations
- React + TypeScript + Vite
- Docker Compose

## Running Locally

From the repository root:

```bash
docker compose up --build
```

Backend health check:

```bash
curl http://localhost:8080/api/health
```

Frontend:

```text
http://localhost:5173
```

Expected health response shape:

```json
{
  "status": "UP",
  "timestamp": "2026-09-06T00:00:00Z"
}
```

## Backend

The backend currently includes:

- `GET /api/health`
- CRUD endpoints for stores, layouts, shelves, shelf sections, products, and product locations
- `GET /api/search/products?query=...`
- Optional search filter with `storeId`

## Frontend

The frontend currently includes a separated configuration and search experience:

- API health status
- Main navigation between configuration and search
- Configuration tabs for store size, shelves, product linking, and products
- Store/layout context selectors
- Visual shelf configuration map
- Shelf creation, editing, drag movement, and deletion
- Section creation, editing, and deletion inside the selected shelf
- Product creation in a dedicated tab
- Product linking to sections without shelf editing
- Product search in a separate screen without the store map for now

The next step is expanding inventory features and polishing the editor experience.



