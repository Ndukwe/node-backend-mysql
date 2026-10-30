# Product Inventory System (Full-Stack)

A complete inventory management system with a **Node.js + Express + MySQL** backend and a modern **React + Tailwind CSS** frontend.

## Features

- **Executive Dashboard**: Real-time KPI summary (total products, in-stock units, inventory cost, retail value, potential margin), quick action shortcuts, recent movement logs, and category overview.
- **Product Catalog Management**: Full CRUD operations for products (SKU, name, category, cost, selling price, unit of measure, reorder level, active status) with search, multi-filter, and pagination.
- **Stock Movement & Audit Trail**: Record Stock In (+), Stock Out (-), and Audit Adjustments (=) with reason presets, reference codes, before/after quantity history, and validation.
- **Low Stock & Reorder Watchlist**: Dedicated view with stock level visual progress bars and instant 1-click restock actions for critical items.
- **Category Taxonomy**: Organize products into categories with live product count badges and filtering.
- **Modern UI / UX**: Built with React 18, Tailwind CSS, Lucide icons, responsive sidebar and mobile drawer navigation, live backend health check, and animated toast alerts.

## Requirements

- Node.js 18+
- MySQL 8+

---

## Getting Started

### 1. Backend Setup

1. Install backend dependencies:

   ```bash
   npm install
   ```

2. Copy the env file and configure your MySQL credentials:

   ```bash
   copy .env.example .env
   ```

3. Initialize the database schema:

   ```bash
   npm run db:init
   ```

4. (Optional) Load sample seed data:

   ```bash
   npm run db:seed
   ```

5. Start the backend API server:

   ```bash
   npm run dev
   ```

   Backend API runs at: `http://localhost:3001/api`

---

### 2. Frontend Setup (React App)

The frontend is located in the `frontend/` directory.

#### Quick Start from Project Root:

To start the React frontend directly from the root directory:

```bash
npm run frontend
```

Or run directly inside `frontend/`:

```bash
cd frontend
npm run dev
```

Frontend app runs at: `http://localhost:5173`

*(Vite is configured to automatically proxy `/api` calls to the Node.js server at `http://localhost:3001`)*

#### Production Build:

```bash
npm run frontend:build
```

---

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

---

## Project Structure

```
node-backend-mysql/
├── frontend/                     # React Single-Page Application (Vite + Tailwind)
│   ├── src/
│   │   ├── api/client.js         # API integration client
│   │   ├── components/
│   │   │   ├── common/           # Button, Card, Modal, Badge, StatCard, SearchInput
│   │   │   ├── layout/           # Sidebar, Header, Layout shell
│   │   │   ├── dashboard/        # DashboardView, LowStockView
│   │   │   ├── products/         # ProductsView, ProductModal, ProductDeleteModal, StockAdjustModal
│   │   │   ├── stock/            # StockMovementsView
│   │   │   └── categories/       # CategoriesView, CategoryModal, CategoryDeleteModal
│   │   ├── context/ToastContext.jsx
│   │   ├── utils/formatters.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── src/                          # Express.js Backend
│   ├── config/db.js              # MySQL connection pool
│   ├── controllers/              # Route controllers
│   ├── db/                       # Schema, init, seed
│   ├── middleware/               # Validation + error handling
│   ├── routes/                   # API routers
│   ├── app.js                    # Express app configuration
│   └── index.js                  # Server entry
├── docs/                         # Postman collections & documentation
├── package.json                  # Root npm scripts
└── README.md
```
