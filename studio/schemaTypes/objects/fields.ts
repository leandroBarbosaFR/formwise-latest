import {defineField, type SlugValidationContext} from 'sanity'

// Set by the translation plugin / structure templates, never edited by hand
export const languageField = defineField({
  name: 'language',
  type: 'string',
  readOnly: true,
  hidden: true,
})

// Slugs only need to be unique within the same document type and language
async function isUniquePerLanguage(slug: string, context: SlugValidationContext) {
  const {document, getClient} = context
  const id = document?._id.replace(/^drafts\./, '')
  return getClient({apiVersion: '2026-10-05'}).fetch<boolean>(
    `!defined(*[_type == $type && language == $language && slug.current == $slug && !(_id in [$draft, $published])][0]._id)`,
    {
      type: document?._type,
      language: document?.language ?? null,
      slug,
      draft: `drafts.${id}`,
      published: id,
    },
  )
}

export function slugField(source = 'title') {
  return defineField({
    name: 'slug',
    type: 'slug',
    options: {source, isUnique: isUniquePerLanguage},
    validation: (rule) => rule.required(),
  })
}
