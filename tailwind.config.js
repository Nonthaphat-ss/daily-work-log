/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                thai: ['Prompt', 'sans-serif'],
                newyork: ['"New York"', '"Playfair Display"', 'Georgia', 'serif'],
                galaxy: ['Cinzel', 'serif'],
                'mono-tech': ['"JetBrains Mono"', 'monospace'],
            },
        },
    },
    plugins: [],
}