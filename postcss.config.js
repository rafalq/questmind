module.exports = {
  plugins: {
    'postcss-flexbugs-fixes': {},
    'postcss-import': {},
    /* Uncomment out if you want to add TailwindCSS to your project */
    // '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
      features: {
        'custom-properties': false,
        'nesting-rules': false,
      },
    },
    'postcss-reporter': {},
  },
}
