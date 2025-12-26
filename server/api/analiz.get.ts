// Nitro API route for Vercel deployment - /api/analiz endpoint
import { defineEventHandler, createError, setResponseStatus } from 'h3';
import type { H3Event } from 'h3';
import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event: H3Event) => {
    try {
        // Initialize Supabase client from environment variables
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            setResponseStatus(event, 500);
            return {
                error: 'Missing Supabase credentials',
                details: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables'
            };
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // --- 1. FIRMS WITH ESTIMATED RETURN (exact legacy query) ---
        const { data: firmsData, error: firmsError } = await supabase
            .from('firmalar')
            .select(`
        id,
        ad,
        ciro,
        firma_tahminleme!inner(tahmini_getiri)
      `)
            .not('firma_tahminleme.tahmini_getiri', 'is', null)
            .order('firma_tahminleme.tahmini_getiri', { ascending: false });

        if (firmsError) {
            console.error('Firms query error:', firmsError);
            setResponseStatus(event, 500);
            return {
                error: 'Database query failed',
                details: firmsError.message
            };
        }

        const firms = firmsData.map(f => ({
            id: f.id,
            ad: f.ad,
            ciro: f.ciro,
            tahmini_getiri: f.firma_tahminleme[0]?.tahmini_getiri || null
        }));

        // --- 2. TOP 7 SUSTAINABILITY SCORES (exact legacy query) ---
        const { data: sustainabilityData, error: sustainabilityError } = await supabase
            .from('firmalar')
            .select(`
        ad,
        firma_tahminleme!inner(surdurulebilirlik_uyum_puani)
      `)
            .order('firma_tahminleme.surdurulebilirlik_uyum_puani', { ascending: false })
            .limit(7);

        if (sustainabilityError) {
            console.error('Sustainability query error:', sustainabilityError);
            setResponseStatus(event, 500);
            return {
                error: 'Database query failed',
                details: sustainabilityError.message
            };
        }

        const sustainability = sustainabilityData.map(s => ({
            ad: s.ad,
            surdurulebilirlik_uyum_puani: s.firma_tahminleme[0]?.surdurulebilirlik_uyum_puani || 0
        }));

        // --- 3. TOP 10 RECYCLING RATES (exact legacy query) ---
        const { data: recyclingData, error: recyclingError } = await supabase
            .from('firmalar')
            .select('ad, geri_donusum_orani')
            .order('geri_donusum_orani', { ascending: false })
            .limit(10);

        if (recyclingError) {
            console.error('Recycling query error:', recyclingError);
            setResponseStatus(event, 500);
            return {
                error: 'Database query failed',
                details: recyclingError.message
            };
        }

        const recycling = recyclingData || [];

        // --- 4. TOP 10 ENTREPRENEUR COMPATIBILITY (exact legacy query) ---
        const { data: entrepreneurData, error: entrepreneurError } = await supabase
            .from('girisimciler')
            .select(`
        isletme_adi,
        kadin_calisan_orani,
        engelli_calisan_orani,
        kurulus_yili,
        girisimci_tahminleme!inner(kriter_uyumluluk_puani)
      `)
            .order('girisimci_tahminleme.kriter_uyumluluk_puani', { ascending: false })
            .limit(10);

        if (entrepreneurError) {
            console.error('Entrepreneur query error:', entrepreneurError);
            setResponseStatus(event, 500);
            return {
                error: 'Database query failed',
                details: entrepreneurError.message
            };
        }

        const entrepreneur = entrepreneurData.map(e => ({
            isletme_adi: e.isletme_adi,
            kriter_uyumluluk_puani: e.girisimci_tahminleme[0]?.kriter_uyumluluk_puani || 0,
            kadin_calisan_orani: e.kadin_calisan_orani,
            engelli_calisan_orani: e.engelli_calisan_orani,
            kurulus_yili: e.kurulus_yili
        }));

        // --- 5. DEFAULT PARAMETERS (exact legacy values) ---
        const defaults = {
            kadinCalisan: 50,
            engelliCalisan: 30,
            kurulusYili: 2015,
            recyclingTarget: 50
        };

        // Return success response
        setResponseStatus(event, 200);
        return {
            firms,
            charts: {
                sustainability,
                recycling,
                entrepreneur
            },
            defaults
        };

    } catch (error: any) {
        console.error('Error in /api/analiz:', error);
        setResponseStatus(event, 500);
        return {
            error: 'Internal server error',
            details: error.message || 'Unknown error occurred'
        };
    }
});
