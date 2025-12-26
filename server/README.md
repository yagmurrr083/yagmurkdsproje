# KDS Backend Server

Backend API for KDS Analysis Dashboard

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Supabase credentials in `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
```

3. Install dependencies:
```bash
npm install
```

4. Start development server:
```bash
npm run dev
```

## Endpoints

### GET /api/analiz
Returns all data for the analysis dashboard.

**Response:**
```json
{
  "firms": [...],
  "charts": {
    "sustainability": [...],
    "recycling": [...],
    "entrepreneur": [...]
  },
  "defaults": {
    "kadinCalisan": 50,
    "engelliCalisan": 30,
    "kurulusYili": 2015,
    "recyclingTarget": 50
  }
}
```

### GET /health
Health check endpoint.
