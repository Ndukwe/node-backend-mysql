# Product Inventory API

Node.js + Express + MySQL backend for a product inventory app.

## Features

- Categories CRUD
- Products CRUD with search, filters, and pagination
- Stock in / out / absolute adjustment with movement history
- Low-stock listing and inventory summary
- Request validation and consistent JSON responses

## Requirements

- Node.js 18+
- MySQL 8+

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and set your MySQL credentials:

```bash
copy .env.example .env
```

3. Create tables:

```bash
npm run db:init
```

4. (Optional) Load sample data:

```bash
npm run db:seed
```

5. Start the server:

```bash
npm run dev
```

API base URL: `http://localhost:3001/api`

## API Endpoints

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |

### Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | List categories |
| GET | `/api/categories/:id` | Get category |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Products

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List products (`search`, `category_id`, `low_stock`, `is_active`, `page`, `limit`) |
| GET | `/api/products/low-stock` | Active products at or below reorder level |
| GET | `/api/products/:id` | Get product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product (quantity via stock endpoints) |
| DELETE | `/api/products/:id` | Delete product |

### Stock

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stock/summary` | Inventory totals |
| GET | `/api/stock/movements` | Movement history (`product_id`, `type`, `page`, `limit`) |
| POST | `/api/stock/adjust` | Adjust stock (`in`, `out`, or `adjustment`) |

## API documentation

- POST request/response docs: [docs/POST_API.md](docs/POST_API.md)
- Postman collection: [docs/Inventory_API.postman_collection.json](docs/Inventory_API.postman_collection.json)

Import the JSON into Postman via **Import → Upload Files**.

## Example requests

Create a category:

```bash
curl -X POST http://localhost:3001/api/categories ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Electronics\",\"description\":\"Gadgets\"}"
```

Create a product:

```bash
curl -X POST http://localhost:3001/api/products ^
  -H "Content-Type: application/json" ^
  -d "{\"sku\":\"ELC-100\",\"name\":\"Keyboard\",\"category_id\":1,\"price\":59.99,\"cost\":30,\"quantity\":50,\"reorder_level\":10}"
```

Stock out 5 units:

```bash
curl -X POST http://localhost:3001/api/stock/adjust ^
  -H "Content-Type: application/json" ^
  -d "{\"product_id\":1,\"movement_type\":\"out\",\"quantity\":5,\"reason\":\"Sale\",\"reference\":\"INV-001\"}"
```

## Project structure

```
src/
  config/db.js          MySQL pool
  controllers/          Route handlers
  db/                   Schema, init, seed
  middleware/           Validation + errors
  routes/               Express routers
  app.js                Express app
  index.js              Server entry
```
