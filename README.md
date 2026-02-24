# Theecal Powersystems and Marketing

Retail Wholesale Billing, Inventory & POS System.

## Quick Start

### 1. Install dependencies
```sh
npm install
```

### 2. Initialize Database (MySQL)
Make sure you have MySQL running and a `.env` file with `DB_PASSWORD`.
```sh
node server/index.cjs
```

### 3. Start Frontend & Backend
```sh
npm run start:dev
```
This will start both the Vite dev server (frontend) and the Node.js API server (backend) concurrently.

## Project Structure
- `src/`: React frontend (Vite + TS + shadcn/ui)
- `server/`: Node.js backend with MySQL

## Features
- POS System with GST calculation
- Inventory Management with multiple warehouses
- Sales Reporting
- Dashboard with insights
