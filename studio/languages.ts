// The 24 official EU languages. Keep in sync with web/src/lib/languages.ts.
export const BASE_LANGUAGE = 'en'

export const LANGUAGES = [
  {id: 'en', title: 'English'},
  {id: 'bg', title: 'Bulgarian'},
  {id: 'cs', title: 'Czech'},
  {id: 'da', title: 'Danish'},
  {id: 'de', title: 'German'},
  {id: 'el', title: 'Greek'},
  {id: 'es', title: 'Spanish'},
  {id: 'et', title: 'Estonian'},
  {id: 'fi', title: 'Finnish'},
  {id: 'fr', title: 'French'},
  {id: 'ga', title: 'Irish'},
  {id: 'hr', title: 'Croatian'},
  {id: 'hu', title: 'Hungarian'},
  {id: 'it', title: 'Italian'},
  {id: 'lt', title: 'Lithuanian'},
  {id: 'lv', title: 'Latvian'},
  {id: 'mt', title: 'Maltese'},
  {id: 'nl', title: 'Dutch'},
  {id: 'pl', title: 'Polish'},
  {id: 'pt', title: 'Portuguese'},
  {id: 'ro', title: 'Romanian'},
  {id: 'sk', title: 'Slovak'},
  {id: 'sl', title: 'Slovenian'},
  {id: 'sv', title: 'Swedish'},
]

// One document per language, linked by the document-internationalization plugin
export const LOCALIZED_TYPES = ['page', 'post', 'category', 'author', 'faq', 'testimonial', 'plan']

// One document per language with a fixed ID: `${type}-${language}`, e.g. `settings-fr`
export const LOCALIZED_SINGLETONS = ['settings', 'header', 'footer']
