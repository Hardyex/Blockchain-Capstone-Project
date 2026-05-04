/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neonBlue: '#00d2ff',
                neonPurple: '#9d00ff',
                darkSlate: '#020617',
            },
            boxShadow: {
                'neon': '0 0 10px #00d2ff, 0 0 20px #00d2ff',
            }
        },
    },
    plugins: [],
}