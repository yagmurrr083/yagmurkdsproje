# KDS Analysis Dashboard - Vercel Deployment

> **Vercel-native Nuxt 3 application with Nitro API routes**

## Architecture

This application runs **entirely on Vercel** using Nuxt/Nitro server routes. No separate Express server needed.

**Frontend**: Nuxt 3 + TailwindCSS + vanilla Chart.js  
**API**: Nitro server routes (`server/api/`)  
**Database**: Supabase (PostgreSQL)

---

## Quick Deploy to Vercel

### 1. Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Supabase credentials

### 2. Deploy from GitHub

1. **Push to GitHub** (if not already):
```bash
git remote add origin https://github.com/yagmurrr083/yagmurkdsproje.git
git push -u origin main
```

2. **Import to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import `yagmurrr083/yagmurkdsproje`
   - Configure environment variables (see below)
   - Click "Deploy"

### 3. Environment Variables (on Vercel)

In Vercel Project Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |

**Important**: Use the **service role key**, not the anon key.

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env file with your Supabase credentials
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

App runs on `http://localhost:3000`

---

## API Endpoint

**GET `/api/analiz`**

Returns all dashboard data:
```json
{
  "firms": [...],
  "charts": {
    "sustainability": [...],
    "recycling": [...],
    "entrepreneur": [...]
  },
  "defaults": { ... }
}
```

Implemented as: `server/api/analiz.get.ts` (Nitro route)

---

## Project Structure

```
├── server/
│   └── api/
│       └── analiz.get.ts      # Nitro API route (Vercel-native)
├── pages/
│   └── index.vue             # Dashboard page
├── assets/
│   └── css/main.css          # TailwindCSS
├── nuxt.config.ts            # Nuxt configuration
├── tailwind.config.js        # Tailwind configuration
└── .env.example              # Environment template
```

**Note**: `_express_reference/` contains old Express code for reference only (not deployed).

---

## Key Features

✅ Single-page dashboard  
✅ Vercel-native (no localhost dependencies)  
✅ Same-origin API calls (`/api/analiz`)  
✅ Exact legacy formulas preserved  
✅ ML pipeline included (for reference)  
✅ Zero security vulnerabilities  

---

## Formulas (Decision-Grade)

### Kadın Girişimci Bütçesi
```javascript
budgetInMillions = (ciro / 1,000,000) × 0.72
```

### Entrepreneur Score Recalculation
```javascript
baseScore += (kadinDiff / 2)        // Weight: 0.5
baseScore += (engelliDiff × 5)      // Weight: 5
baseScore += (yilDiff / 2)          // Weight: 0.5
score = clamp(round(baseScore), 0, 100)
```

---

## Troubleshooting

### Build Fails on Vercel
- Check environment variables are set correctly
- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present

### API Returns 500 Error
- Verify Supabase credentials in Vercel environment variables
- Check Supabase tables exist: `firmalar`, `girisimciler`, `firma_tahminleme`, `girisimci_tahminleme`

### Charts Not Displaying
- Check browser console for errors
- Verify `/api/analiz` returns data successfully

---

## Support

For issues, check:
1. Vercel deployment logs
2. Browser console (F12)
3. `/api/analiz` endpoint response

---

## License

ISC
