// Production-grade Nitro API route for Vercel deployment
// /api/analiz endpoint with comprehensive error handling
import { defineEventHandler, setResponseStatus } from 'h3';
import type { H3Event } from 'h3';
import { createClient } from '@supabase/supabase-js';

// Generate trace ID for debugging
function generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default defineEventHandler(async (event: H3Event) => {
    const traceId = generateTraceId();

    try {
        // ========================================
        // STEP 1: ENV VALIDATION
        // ========================================
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error(`[${traceId}] Missing environment variables`);
            setResponseStatus(event, 503);
            return {
                error: 'MISSING_ENV',
                missing: [
                    ...(!supabaseUrl ? ['SUPABASE_URL'] : []),
                    ...(!supabaseKey ? ['SUPABASE_SERVICE_ROLE_KEY'] : [])
                ],
                hint: 'Set these environment variables in Vercel Project Settings → Environment Variables',
                traceId
            };
        }

        // ========================================
        // STEP 2: INITIALIZE SUPABASE CLIENT
        // ========================================
        let supabase;
        try {
            supabase = createClient(supabaseUrl, supabaseKey);
        } catch (error: any) {
            console.error(`[${traceId}] Step 2 failed - Supabase client init:`, error);
            setResponseStatus(event, 503);
            return {
                error: 'SUPABASE_INIT_FAILED',
                step: 'initialize_client',
                reason: error.message,
                hint: 'Check if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are valid',
                traceId
            };
        }

        // ========================================
        // STEP 3: FETCH FIRMS WITH ESTIMATED RETURN
        // ========================================
        let firms;
        try {
            // Fixed query: Use RPC or fetch separately instead of ordering by nested field
            const { data: firmsRaw, error: firmsError } = await supabase
                .from('firmalar')
                .select('id, ad, ciro')
                .order('id', { ascending: true });

            if (firmsError) throw firmsError;

            // Fetch predictions separately
            const { data: predictions, error: predError } = await supabase
                .from('firma_tahminleme')
                .select('firma_id, tahmini_getiri')
                .not('tahmini_getiri', 'is', null)
                .order('tahmini_getiri', { ascending: false });

            if (predError) throw predError;

            // Join in memory
            const firmMap = new Map(firmsRaw.map(f => [f.id, f]));
            firms = (predictions || [])
                .map(p => {
                    const firm = firmMap.get(p.firma_id);
                    return firm ? {
                        id: firm.id,
                        ad: firm.ad,
                        ciro: firm.ciro,
                        tahmini_getiri: p.tahmini_getiri
                    } : null;
                })
                .filter(Boolean);

        } catch (error: any) {
            console.error(`[${traceId}] Step 3 failed - Firms query:`, error);
            setResponseStatus(event, 502);
            return {
                error: 'DB_QUERY_FAILED',
                step: 'fetch_firms',
                reason: error.message || 'Unknown database error',
                hint: 'Check if tables "firmalar" and "firma_tahminleme" exist with correct columns',
                traceId
            };
        }

        // ========================================
        // STEP 4: FETCH CHART DATASETS
        // ========================================
        let sustainability, recycling, entrepreneur;

        try {
            // 4a: Top 7 Sustainability Scores
            const { data: sustRaw, error: sustError } = await supabase
                .from('firmalar')
                .select('id, ad')
                .order('id', { ascending: true });

            if (sustError) throw sustError;

            const { data: sustScores, error: sustScoresError } = await supabase
                .from('firma_tahminleme')
                .select('firma_id, surdurulebilirlik_uyum_puani')
                .not('surdurulebilirlik_uyum_puani', 'is', null)
                .order('surdurulebilirlik_uyum_puani', { ascending: false })
                .limit(7);

            if (sustScoresError) throw sustScoresError;

            const sustMap = new Map(sustRaw.map(f => [f.id, f.ad]));
            sustainability = (sustScores || []).map(s => ({
                ad: sustMap.get(s.firma_id) || 'Unknown',
                surdurulebilirlik_uyum_puani: s.surdurulebilirlik_uyum_puani
            }));

        } catch (error: any) {
            console.error(`[${traceId}] Step 4a failed - Sustainability query:`, error);
            setResponseStatus(event, 502);
            return {
                error: 'DB_QUERY_FAILED',
                step: 'fetch_sustainability',
                reason: error.message,
                hint: 'Check if table "firma_tahminleme" has column "surdurulebilirlik_uyum_puani"',
                traceId
            };
        }

        try {
            // 4b: Top 10 Recycling Rates
            const { data: recyclingData, error: recyclingError } = await supabase
                .from('firmalar')
                .select('ad, geri_donusum_orani')
                .not('geri_donusum_orani', 'is', null)
                .order('geri_donusum_orani', { ascending: false })
                .limit(10);

            if (recyclingError) throw recyclingError;

            recycling = recyclingData || [];

        } catch (error: any) {
            console.error(`[${traceId}] Step 4b failed - Recycling query:`, error);
            setResponseStatus(event, 502);
            return {
                error: 'DB_QUERY_FAILED',
                step: 'fetch_recycling',
                reason: error.message,
                hint: 'Check if table "firmalar" has column "geri_donusum_orani"',
                traceId
            };
        }

        try {
            // 4c: Top 10 Entrepreneur Compatibility
            const { data: entrRaw, error: entrError } = await supabase
                .from('girisimciler')
                .select('id, isletme_adi, kadin_calisan_orani, engelli_calisan_orani, kurulus_yili')
                .order('id', { ascending: true });

            if (entrError) throw entrError;

            const { data: entrScores, error: entrScoresError } = await supabase
                .from('girisimci_tahminleme')
                .select('girisimci_id, kriter_uyumluluk_puani')
                .not('kriter_uyumluluk_puani', 'is', null)
                .order('kriter_uyumluluk_puani', { ascending: false })
                .limit(10);

            if (entrScoresError) throw entrScoresError;

            const entrMap = new Map(entrRaw.map(e => [e.id, e]));
            entrepreneur = (entrScores || []).map(s => {
                const entr = entrMap.get(s.girisimci_id);
                return entr ? {
                    isletme_adi: entr.isletme_adi,
                    kriter_uyumluluk_puani: s.kriter_uyumluluk_puani,
                    kadin_calisan_orani: entr.kadin_calisan_orani,
                    engelli_calisan_orani: entr.engelli_calisan_orani,
                    kurulus_yili: entr.kurulus_yili
                } : null;
            }).filter(Boolean);

        } catch (error: any) {
            console.error(`[${traceId}] Step 4c failed - Entrepreneur query:`, error);
            setResponseStatus(event, 502);
            return {
                error: 'DB_QUERY_FAILED',
                step: 'fetch_entrepreneur',
                reason: error.message,
                hint: 'Check if tables "girisimciler" and "girisimci_tahminleme" exist with correct columns',
                traceId
            };
        }

        // ========================================
        // STEP 5: COMPUTE DEFAULT PARAMETERS
        // ========================================
        const defaults = {
            kadinCalisan: 50,
            engelliCalisan: 30,
            kurulusYili: 2015,
            recyclingTarget: 50
        };

        // ========================================
        // STEP 6: RETURN SUCCESS RESPONSE
        // ========================================
        console.log(`[${traceId}] Success - returning ${firms.length} firms, ${sustainability.length} sustainability, ${recycling.length} recycling, ${entrepreneur.length} entrepreneur`);

        setResponseStatus(event, 200);
        return {
            firms,
            charts: {
                sustainability,
                recycling,
                entrepreneur
            },
            defaults,
            _meta: {
                traceId,
                timestamp: new Date().toISOString()
            }
        };

    } catch (error: any) {
        // ========================================
        // GLOBAL ERROR HANDLER
        // ========================================
        console.error(`[${traceId}] Unexpected error in /api/analiz:`, error.stack || error);
        setResponseStatus(event, 500);
        return {
            error: 'ANALIZ_API_FAILED',
            reason: 'Unexpected server error',
            hint: 'Check server logs for details',
            traceId,
            // Only include stack in development
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        };
    }
});
