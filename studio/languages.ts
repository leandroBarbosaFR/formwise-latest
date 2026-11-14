// The languages the website is published in. Keep in sync with web/src/lib/languages.ts and
// functions/translate/index.ts.
export const BASE_LANGUAGE = 'fr'

export const LANGUAGES = [
  {id: 'fr', title: 'French'},
  {id: 'en', title: 'English'},
  {id: 'es', title: 'Spanish'},
]

// One document per language, linked by the document-internationalization plugin
export const LOCALIZED_TYPES = ['page', 'post', 'category', 'author', 'faq', 'testimonial', 'plan']

// One document per language with a fixed ID: `${type}-${language}`, e.g. `settings-fr`
export const LOCALIZED_SINGLETONS = ['settings', 'header', 'footer']
