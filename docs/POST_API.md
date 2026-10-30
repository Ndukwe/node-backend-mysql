# POST API Documentation

Base URL: `http://localhost:3001/api`  
Content-Type: `application/json`

---

## 1. Create Category

`POST /api/categories`

Creates a new product category.

### Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | Max 100 chars, unique |
| `description` | string \| null | No | Max 255 chars |

### Example request

```bash
curl -X POST http://localhost:3001/api/categories ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Electronics\",\"description\":\"Phones, laptops, and accessories\"}"
```

```json
{
  "name": "Electronics",
  "description": "Phones, laptops, and accessories"
}
```

### Success response — `201`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Electronics",
    "description": "Phones, laptops, and accessories",
    "created_at": "2026-10-30T11:00:00.000Z",
    "updated_at": "2026-10-30T11:00:00.000Z"
  }
}
```

### Error responses

| Status | When |
|--------|------|
| `400` | Validation failed (missing/empty name) |
| `409` | Category name already exists |

---

## 2. Create Product

`POST /api/products`

Creates a product. If `quantity` &gt; 0, an initial stock movement is recorded automatically.

### Body

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `sku` | string | Yes | — | Max 64 chars, unique |
| `name` | string | Yes | — | Max 150 chars |
| `description` | string \| null | No | `null` | |
| `category_id` | integer \| null | No | `null` | Must exist if provided |
| `price` | number | No | `0` | ≥ 0 |
| `cost` | number | No | `0` | ≥ 0 |
| `quantity` | integer | No | `0` | ≥ 0 |
| `reorder_level` | integer | No | `10` | ≥ 0 |
| `unit` | string | No | `"pcs"` | Max 30 chars |
| `is_active` | boolean | No | `true` | |

### Example request

```bash
curl -X POST http://localhost:3001/api/products ^
  -H "Content-Type: application/json" ^
  -d "{\"sku\":\"ELC-100\",\"name\":\"Mechanical Keyboard\",\"description\":\"RGB backlit keyboard\",\"category_id\":1,\"price\":59.99,\"cost\":30,\"quantity\":50,\"reorder_level\":10,\"unit\":\"pcs\",\"is_active\":true}"
```

```json
{
  "sku": "ELC-100",
  "name": "Mechanical Keyboard",
  "description": "RGB backlit keyboard",
  "category_id": 1,
  "price": 59.99,
  "cost": 30,
  "quantity": 50,
  "reorder_level": 10,
  "unit": "pcs",
  "is_active": true
}
```

### Success response — `201`

```json
{
  "success": true,
  "data": {
    "id": 5,
    "sku": "ELC-100",
    "name": "Mechanical Keyboard",
    "description": "RGB backlit keyboard",
    "category_id": 1,
    "price": "59.99",
    "cost": "30.00",
    "quantity": 50,
    "reorder_level": 10,
    "unit": "pcs",
    "is_active": 1,
    "created_at": "2026-10-30T11:05:00.000Z",
    "updated_at": "2026-10-30T11:05:00.000Z",
    "category_name": "Electronics",
    "is_low_stock": 0
  }
}
```

### Error responses

| Status | When |
|--------|------|
| `400` | Validation failed, or `category_id` does not exist |
| `409` | SKU already exists |

---

## 3. Adjust Stock

`POST /api/stock/adjust`

Increases, decreases, or sets product quantity. Always writes a stock movement record.

### Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `product_id` | integer | Yes | Must exist |
| `movement_type` | string | Yes | `"in"`, `"out"`, or `"adjustment"` |
| `quantity` | integer | Yes | For `in`/`out`: units to move (≥ 1). For `adjustment`: new absolute stock (≥ 0) |
| `reason` | string \| null | No | Max 255 chars |
| `reference` | string \| null | No | Max 100 chars (e.g. invoice/PO number) |

### Movement types

| Type | Effect |
|------|--------|
| `in` | Adds `quantity` to current stock |
| `out` | Subtracts `quantity` (fails if insufficient stock) |
| `adjustment` | Sets stock to exactly `quantity` |

### Example — stock in

```bash
curl -X POST http://localhost:3001/api/stock/adjust ^
  -H "Content-Type: application/json" ^
  -d "{\"product_id\":1,\"movement_type\":\"in\",\"quantity\":20,\"reason\":\"Supplier delivery\",\"reference\":\"PO-1001\"}"
```

```json
{
  "product_id": 1,
  "movement_type": "in",
  "quantity": 20,
  "reason": "Supplier delivery",
  "reference": "PO-1001"
}
```

### Example — stock out

```json
{
  "product_id": 1,
  "movement_type": "out",
  "quantity": 5,
  "reason": "Customer sale",
  "reference": "INV-204"
}
```

### Example — absolute adjustment

```json
{
  "product_id": 1,
  "movement_type": "adjustment",
  "quantity": 100,
  "reason": "Stocktake correction"
}
```

### Success response — `201`

```json
{
  "success": true,
  "data": {
    "id": 12,
    "product_id": 1,
    "movement_type": "out",
    "quantity": 5,
    "previous_quantity": 120,
    "new_quantity": 115,
    "reason": "Customer sale",
    "reference": "INV-204",
    "created_at": "2026-10-30T11:10:00.000Z",
    "sku": "ELC-001",
    "product_name": "Wireless Mouse"
  }
}
```

### Error responses

| Status | When |
|--------|------|
| `400` | Validation failed, invalid `movement_type`, `in`/`out` quantity &lt; 1, or insufficient stock |
| `404` | Product not found |

---

## Common validation error shape — `400`

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "name is required"
    }
  ]
}
```
