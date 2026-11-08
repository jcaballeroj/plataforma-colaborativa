import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    // El diseño es claro. Con 'class' los estilos dark: dejan de activarse
    // solos cuando el sistema operativo está en modo oscuro.
    darkMode: 'class',

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Instrument Sans"', ...defaultTheme.fontFamily.sans],
                display: ['"Bricolage Grotesque"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // "indigo" pasa a ser el verde pino de la marca: todas las
                // pantallas que ya usan indigo-* heredan el color nuevo.
                indigo: {
                    50: '#EDF6F3',
                    100: '#D3EAE3',
                    200: '#A9D5C8',
                    300: '#77BBA8',
                    400: '#3F9A84',
                    500: '#1F7C69',
                    600: '#0E6455',
                    700: '#0B5247',
                    800: '#09423A',
                    900: '#07342E',
                },
                // Grises con un matiz verdoso para que combinen con el pino.
                gray: {
                    50: '#F6F8F6',
                    100: '#EEF2EF',
                    200: '#DEE5E0',
                    300: '#C5CFC9',
                    400: '#93A29A',
                    500: '#6B7B73',
                    600: '#51605A',
                    700: '#3B4842',
                    800: '#27322D',
                    900: '#17211C',
                },
                // Amarillo marcador: solo para detalles puntuales.
                marker: {
                    DEFAULT: '#F5C842',
                    soft: '#FCEBB0',
                },
            },
        },
    },

    plugins: [forms],
};
