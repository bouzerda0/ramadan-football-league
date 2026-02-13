# Zone 01 Oujda - Ramadan Football League 2026

This project consists of a **Go backend** (API & Static File Server) and a **React frontend** (Single Page Application).

## Project Structure

- `backend/`: Go server code (`main.go`, `go.mod`, etc.)
- `frontend/`: React application code (`src/`, `package.json`, etc.)

## How to Run (Development)

To run the project locally for development, you need two terminal windows.

### 1. Start the Backend Server
This runs the Go API server on `http://localhost:8080`.

```bash
cd backend
go run main.go
```

### 2. Start the Frontend Development Server
This runs the React dev server (Vite) on `http://localhost:5173`.
It is configured to proxy API requests to the backend.

```bash
cd frontend
npm run dev
```

**Access the app at:** `http://localhost:5173`

---

## How to Build & Run (Production)

To run the application as a single production-ready server:

1.  **Build the Frontend:**
    ```bash
    cd frontend
    npm run build
    ```
    This creates a `dist` folder in `frontend/`.

2.  **Run the Backend:**
    ```bash
    cd ../backend  # if you were in frontend
    go run main.go
    ```

**Access the app at:** `http://localhost:8080`
