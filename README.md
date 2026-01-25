# Highlight Edit

A SaaS application for HR and Legal professionals to convert highlighted document sections into editable form fields. Upload a Word document with yellow highlights, filling in the blanks through a web interface, and export the result as a new Word document or PDF.

## Features

- **Smart Detection**: Automatically detects yellow highlighted text in `.docx` files.
- **Dynamic Forms**: Generates a user-friendly form based on detected highlights.
- **Multi-Format Export**: Export filled documents as `.docx` or `.pdf`.
- **Custom Filenames**: Rename your output file before exporting.
- **Preview Mode**: Preview your document with filled data before downloading.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Python, FastAPI
- **Database**: SQLite (SQLAlchemy)

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)

### Quick Start (Recommended)

The easiest way to run the application locally (without Docker) is using the included start script:

```bash
./start_app.sh
```

This script will:
1. Set up the Python virtual environment and install backend dependencies.
2. Install frontend dependencies.
3. Start both the backend (port 8000) and frontend (port 5173) servers.

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Manual Setup

If you prefer to run services manually:

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Docker Setup

To run with Docker using the local development configuration:

```bash
docker compose -f docker-compose.dev.yml up --build
```

> **Note**: The default `docker-compose.yml` uses a pre-built image. For local development with hot-reloading, always use `docker-compose.dev.yml`.
