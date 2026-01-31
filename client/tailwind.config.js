/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#2563EB", // Blue-600
                secondary: "#9333EA", // Purple-600
                dark: "#0F172A", // Slate-900
                light: "#F8FAFC", // Slate-50
            }
        },
    },
    plugins: [],
}
