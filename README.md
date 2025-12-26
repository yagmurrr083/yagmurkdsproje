# KDS Analysis Dashboard

> **Decision-grade sustainability analytics dashboard built with Nuxt 3 + Express.js**

## Project Structure

```
YAGMURKDSPROJE/
├── server/              # Backend (Express.js + Supabase)
│   ├── controllers/
│   ├── db/
│   ├── routers/
│   ├── app.js
│   └── package.json
├── pages/               # Frontend pages (Nuxt 3)
│   └── index.vue       # Main dashboard
├── assets/              # Styles
│   └── css/main.css
├── nuxt.config.ts       # Nuxt configuration
├── tailwind.config.js   # TailwindCSS config
└── package.json         # Frontend dependencies
```

## Quick Start

### 1. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your Supabase credentials
npm install
npm run dev
```

Backend will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
# From project root
cp .env.example .env
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (`server/.env`)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
```

### Frontend (`.env`)
```
NUXT_PUBLIC_API_BASE=http://localhost:3001
```

## Features

✅ **Single-page dashboard** (no navigation, no sidebar)  
✅ **Exact legacy formulas** for all calculations  
✅ **ML predictions** consumed as-is (no changes to ML logic)  
✅ **TailwindCSS** styling (no Bootstrap)  
✅ **Vanilla Chart.js** (no vue-chartjs wrapper)  
✅ **Decision-grade reliability** (deterministic outputs)

## Dashboard Components

### Top Metric Cards
1. **Tahmini Getiri (M)** - Estimated return from ML predictions
2. **Kadın Girişimci Bütçesi (M)** - Calculated as `(ciro / 1,000,000) × 0.72`
3. **Firma Seçiniz** - Firm selector dropdown

### Charts
1. **Sürdürülebilirlik Uyum Puanı (Top 7)** - Doughnut chart of top 7 firms
2. **Atık Geri Dönüşüm Oranı (Top 10)** - Line chart with adjustable reference line
3. **Girişimci Uyumluluk Analizi (Top 10)** - Bar chart with dynamic recalculation

### Parameter-Driven Recalculation
The entrepreneur compatibility chart recalculates scores based on three parameters:
- **Kadın Çalışan Oranı**: 0-100% (default: 50%)
- **Engelli Çalışan Oranı**: 0-100% (default: 30%)
- **Kuruluş Yılı**: 2000-2025 (default: 2015)

**Formula (exact legacy):**
```javascript
baseScore += (kadinDiff / 2);         // Weight: 0.5
baseScore += (engelliDiff * 5);       // Weight: 5
baseScore += (yilDiff / 2);           // Weight: 0.5
score = Math.min(100, Math.max(0, Math.round(baseScore)));
```

## API Endpoints

### GET `/api/analiz`
Returns all dashboard data in a single request.

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

## Technology Stack

**Backend:**
- Node.js + Express.js
- Supabase (PostgreSQL)
- @supabase/supabase-js

**Frontend:**
- Nuxt 3 (Vue 3)
- TailwindCSS
- Chart.js (vanilla)

## Decision-Grade Requirements

✅ Mathematical correctness (exact legacy formulas)  
✅ Data consistency (single source of truth)  
✅ Deterministic behavior (same input → same output)  
✅ Graph interpretability (correct scales, axes, units)  
✅ UI stability (no duplicated charts, no memory leaks)

## License

ISC
