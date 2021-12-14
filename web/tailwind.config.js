// tailwind.config.js
const colors = require('tailwindcss/colors');
module.exports = {
  purge: ['./public/**/*.html', './src/**/*.jsx'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '480px',
        '2xl': '1536px',
        '3xl': '1720px',
      },
      colors: {
        // Configure your color palette here
        transparent: 'transparent',
        current: 'currentColor',
        primary: {
          light: '#E3E2E2',
          DEFAULT: '#E3E2E2',
          dark: '#1C1B1B',
        },
        secondary: {
          light: '#5452dead',
          DEFAULT: '#5452dead',
          dark: '#5452dead',
        },
      },
    },
    boxShadow: {
      sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      DEFAULT: '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);',
      md: '0px 2px 2px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);',
      lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
      xl: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
      '2xl': '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
      '3xl': '',
      none: '',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
