import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

// Keep in sync with studio/languages.ts and functions/translate/index.ts
const TRANSLATED_TYPES = ['settings', 'header', 'footer', 'page', 'post', 'category', 'author', 'faq', 'testimonial', 'plan']
const SINGLETON_TYPES = ['settings', 'header', 'footer']
const ENGLISH_SINGLETONS = SINGLETON_TYPES.map((type) => `${type}-en`)

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: 'translate',
      timeout: 300,
      event: {
        on: ['create', 'update'],
        // Only published English originals trigger a translation. Documents written by the
        // function (IDs starting with "tr-", and non-English singletons like "settings-fr")
        // are excluded by ID, so the function can never trigger itself, whatever their language.
        filter: [
          `_type in ${JSON.stringify(TRANSLATED_TYPES)}`,
          `language == "en"`,
          `!(_id in path("drafts.**"))`,
          `!string::startsWith(_id, "tr-")`,
          `(_id in ${JSON.stringify(ENGLISH_SINGLETONS)} || !(_type in ${JSON.stringify(SINGLETON_TYPES)}))`,
        ].join(' && '),
        projection: '{_id, _type}',
      },
    }),
  ],
})
