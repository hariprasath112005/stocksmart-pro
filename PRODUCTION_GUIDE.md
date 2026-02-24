# Theecal Powersystems and Marketing - Production & Build Guide

This document summarizes the state of the project, recent fixes, and instructions for building production-ready binaries for both Linux and Windows.

## 🚀 Recent Critical Fixes

### 1. Production Database Connectivity
*   **Issue:** The Linux AppImage was failing to connect to the database because the Electron main process was looking for `server-dist/index.js`, but the build process (ncc) was outputting `server-dist/index.cjs`.
*   **Fix:** Updated `electron/main.cjs` to correctly point to the `.cjs` extension in production.
*   **Result:** The production binary now successfully launches the backend server.

### 2. Automatic Database Initialization
*   **Enhancement:** The backend server (`server/index.cjs`) has been upgraded with an `initializeDatabase()` function.
*   **Feature:** On startup, the app now automatically:
    *   Creates the `theecal_db` database if it doesn't exist.
    *   Creates the `products`, `sales`, and `sale_items` tables if they are missing.
*   **Result:** The application is now "plug-and-play" on any machine with a running MySQL server.

---

## 📦 Building for Windows (.exe)

### Recommended Method: Build on Windows
Due to dependency conflicts with `wine32` on Debian (specifically `libc6` version mismatches), it is strongly recommended to build the Windows version on a Windows machine.

1.  **On a Windows Machine:**
    *   Install Node.js (LTS).
    *   Copy the `theecal-powersystems` folder to the machine.
    *   Open terminal in the folder and run:
        ```powershell
        npm install
        npm run electron:build
        ```
2.  **Output:** The installer will be located in the `release/` folder as `Theecal Powersystems and Marketing Setup 1.0.0.exe`.

### Alternative: Build on Linux (Debian)
If you manage to resolve the `wine32:i386` dependency issue:
1.  Run: `npm run electron:build:win`
2.  *Note: This requires a working Wine environment with 32-bit support.*

---

## 🛠️ Project Configuration

### Key Files
*   **`electron/main.cjs`**: Controls the Electron window and forks the backend server.
*   **`server/index.cjs`**: The Express backend. Handles MySQL logic and auto-initialization.
*   **`package.json`**: Contains build configurations (`build` field) and scripts.

### Build Scripts
*   `npm run build`: Builds the React frontend (Vite).
*   `npm run build:server`: Bundles the backend server into a single file (`ncc`).
*   `npm run electron:build`: Builds the production app for the current OS.
*   `npm run electron:build:win`: Explicitly targets Windows (for cross-compiling).

---

## ⚠️ Production Requirements
1.  **MySQL Server**: The application requires a MySQL server running (defaulting to `localhost:3306`).
2.  **Environment Variables**: Ensure a `.env` file exists in the root (or in the `resources` folder of the packed app) with:
    *   `DB_HOST` (default: localhost)
    *   `DB_USER` (default: root)
    *   `DB_PASSWORD` (Your MySQL password)
