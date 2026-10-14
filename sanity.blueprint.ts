import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

// Keep in sync with studio/languages.ts and functions/translate/index.ts
const TRANSLATED_TYPES = ['settings', 'header', 'footer', 'page', 'post', 'category', 'author', 'faq', 'testimonial', 'plan']
const SINGLETON_TYPES = ['settings', 'header', 'footer']
const BASE_SINGLETONS = SINGLETON_TYPES.map((type) => `${type}-fr`)

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: 'translate',
      timeout: 300,
      event: {
        on: ['create', 'update'],
        // Only published French originals trigger a translation. The function only writes the
        // other languages (and singletons like "settings-en"), so it can never trigger itself.
        // French documents may have "tr-" IDs: they were created when English was the source.
        filter: [
          `_type in ${JSON.stringify(TRANSLATED_TYPES)}`,
          `language == "fr"`,
          `!(_id in path("drafts.**"))`,
          `(_id in ${JSON.stringify(BASE_SINGLETONS)} || !(_type in ${JSON.stringify(SINGLETON_TYPES)}))`,
        ].join(' && '),
        projection: '{_id, _type, language}',
      },
    }),
  ],
})
