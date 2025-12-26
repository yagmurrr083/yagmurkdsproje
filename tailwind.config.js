export default {
    content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0d6efd',
                    dark: '#0043a8',
                },
                success: '#1cc88a',
                danger: '#e74a3b',
                warning: '#f6c23e',
                info: '#36b9cc',
                gray: {
                    light: '#858796',
                    DEFAULT: '#5a5c69',
                }
            }
        }
    },
    plugins: []
}
