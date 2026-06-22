import next from 'eslint-config-next'
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import prettier from 'eslint-config-prettier'

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'cypress/**', 'src/pages_tmp/**'],
  },
  ...next,
  ...coreWebVitals,
  prettier,
]

export default config
