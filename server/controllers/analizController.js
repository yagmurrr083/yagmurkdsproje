const supabase = require('../db/supabase');

/**
 * GET /api/analiz
 * 
 * Returns all data needed for the analysis dashboard in a single request.
 * EXACT REPLICATION of legacy AnalizController.js logic.
 * 
 * Response structure:
 * {
 *   firms: [...],
 *   charts: {
 *     sustainability: [...],
 *     recycling: [...],
 *     entrepreneur: [...]
 *   },
 *   defaults: {
 *     kadinCalisan: 50,
 *     engelliCalisan: 30,
 *     kurulusYili: 2015,
 *     recyclingTarget: 50
 *   }
 * }
 */
const getAnalizData = async (req, res) => {
    try {
        // --- 1. FIRMS WITH ESTIMATED RETURN (for dropdown + Tahmini Getiri card) ---
        // EXACT query from legacy AnalizController.js:7-17
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

        if (firmsError) throw firmsError;

        // Transform to match legacy structure
        const firms = firmsData.map(f => ({
            id: f.id,
            ad: f.ad,
            ciro: f.ciro,
            tahmini_getiri: f.firma_tahminleme[0]?.tahmini_getiri || null
        }));

        // --- 2. TOP 7 SUSTAINABILITY SCORES (pie chart) ---
        // EXACT query from legacy AnalizController.js:20-28
        const { data: sustainabilityData, error: sustainabilityError } = await supabase
            .from('firmalar')
            .select(`
        ad,
        firma_tahminleme!inner(surdurulebilirlik_uyum_puani)
      `)
            .order('firma_tahminleme.surdurulebilirlik_uyum_puani', { ascending: false })
            .limit(7);

        if (sustainabilityError) throw sustainabilityError;

        const sustainability = sustainabilityData.map(s => ({
            ad: s.ad,
            surdurulebilirlik_uyum_puani: s.firma_tahminleme[0]?.surdurulebilirlik_uyum_puani || 0
        }));

        // --- 3. TOP 10 RECYCLING RATES (line chart) ---
        // EXACT query from legacy AnalizController.js:31-38
        const { data: recyclingData, error: recyclingError } = await supabase
            .from('firmalar')
            .select('ad, geri_donusum_orani')
            .order('geri_donusum_orani', { ascending: false })
            .limit(10);

        if (recyclingError) throw recyclingError;

        const recycling = recyclingData || [];

        // --- 4. TOP 10 ENTREPRENEUR COMPATIBILITY (bar chart) ---
        // EXACT query from legacy AnalizController.js:42-53
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

        if (entrepreneurError) throw entrepreneurError;

        const entrepreneur = entrepreneurData.map(e => ({
            isletme_adi: e.isletme_adi,
            kriter_uyumluluk_puani: e.girisimci_tahminleme[0]?.kriter_uyumluluk_puani || 0,
            kadin_calisan_orani: e.kadin_calisan_orani,
            engelli_calisan_orani: e.engelli_calisan_orani,
            kurulus_yili: e.kurulus_yili
        }));

        // --- 5. DEFAULT PARAMETERS ---
        // From legacy analiz.ejs default values
        const defaults = {
            kadinCalisan: 50,
            engelliCalisan: 30,
            kurulusYili: 2015,
            recyclingTarget: 50
        };

        // --- RESPONSE ---
        res.status(200).json({
            firms,
            charts: {
                sustainability,
                recycling,
                entrepreneur
            },
            defaults
        });

    } catch (error) {
        console.error('Error in getAnalizData:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

module.exports = {
    getAnalizData
};
