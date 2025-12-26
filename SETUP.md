# Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Supabase account with existing database
- Supabase credentials from legacy system

## Step-by-Step Setup

### 1. Get Supabase Credentials

You need to copy your Supabase credentials from the legacy system.

**Option A:** Check `yagmurkds-legacy/ml/.env` (if it exists)
**Option B:** Check your Supabase dashboard: Settings → API

You need:
- `SUPABASE_URL` (format: https://xxxxx.supabase.co)
- `SUPABASE_SERVICE_ROLE_KEY` (long JWT token)

### 2. Backend Setup

```bash
cd server
```

Copy the example env file:
```bash
cp .env.example .env
```

Edit `server/.env` with your credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=3001
```

Install dependencies:
```bash
npm install
```

Start backend:
```bash
npm run dev
```

✅ Backend should be running on `http://localhost:3001`

Test the API:
```bash
curl http://localhost:3001/api/analiz
```

### 3. Frontend Setup

Open a NEW terminal window, navigate to project root:
```bash
cd c:\Users\Yağmur\Desktop\YAGMURKDSPROJE
```

Copy the example env file (optional, uses localhost:3001 by default):
```bash
cp .env.example .env
```

Install dependencies:
```bash
npm install
```

Start frontend:
```bash
npm run dev
```

✅ Frontend should be running on `http://localhost:3000`

### 4. Verify Installation

Open browser: `http://localhost:3000`

You should see:
- ✅ 3 metric cards at top
- ✅ 2 charts in first row (pie + line)
- ✅ 1 bar chart in second row
- ✅ No console errors

## Common Issues

### Backend won't start
- **Check:** Supabase credentials are correct in `server/.env`
- **Check:** Port 3001 is not already in use
- **Fix:** Stop any other services using port 3001

### Frontend shows "Veri yüklenirken hata oluştu"
- **Check:** Backend is running on port 3001
- **Check:** `http://localhost:3001/api/analiz` returns JSON
- **Fix:** Restart backend server

### Charts not displaying
- **Check:** Browser console for errors (F12)
- **Check:** Network tab shows successful API call
- **Fix:** Clear cache and hard reload (Ctrl+Shift+R)

### "Missing Supabase credentials" error
- **Check:** `server/.env` file exists and has valid values
- **Check:** No extra quotes around values in .env
- **Fix:** Remove quotes, restart backend

## Next Steps

Once both servers are running:
1. Select a firm from the dropdown
2. Verify metric cards update
3. Adjust parameter sliders
4. Verify charts recalculate

Refer to `README.md` for full feature documentation.
