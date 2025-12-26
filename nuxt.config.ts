// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },

    modules: ['@nuxtjs/tailwindcss'],

    css: ['~/assets/css/main.css'],

    runtimeConfig: {
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001'
        }
    },

    app: {
        head: {
            title: 'KDS - Analiz Paneli',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'KDS Decision Support System - Analysis Dashboard' }
            ],
            script: []
        }
    }
})
