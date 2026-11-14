import {randomUUID} from 'node:crypto'
import {documentEventHandler} from '@sanity/functions'
import {createClient} from '@sanity/client'

// Translates every published French document into English and Spanish using Sanity Agent
// Actions. Keep the language lists in sync with studio/languages.ts and web/src/lib/languages.ts.

// Deployed schema of the "default" Studio workspace (`npx sanity schema deploy`)
const SCHEMA_ID = '_.schemas.default'

// true: translations go live straight away. false: they are saved as drafts to review first.
const PUBLISH_TRANSLATIONS = true

const BASE_LANGUAGE = {id: 'fr', title: 'French'}
const TARGET_LANGUAGES = [
  {id: 'en', title: 'English'},
  {id: 'es', title: 'Spanish'},
]

// Same tone as the Studio's AI Assist. Without it, Spanish mixes "tú" and "usted" from page to page.
const STYLE_GUIDE =
  'Formwise is software for associations, clubs and non-profits. Warm, clear and professional tone. ' +
  'Keep the product name Formwise, URLs and currency formats unchanged. ' +
  'Address the reader with the formal form where the language has one (usted in Spanish), consistently throughout.'

// Both languages are translated at the same time, well inside the function timeout
const CONCURRENCY = 2

// Singletons use a fixed ID per language (`settings-fr`) instead of translation metadata
const SINGLETON_TYPES = ['settings', 'header', 'footer']

interface EventData {
  _id: string
  _type: string
  language?: string
}

// Same shape the document-internationalization plugin writes: the language is in `language`,
// `_key` is random (older entries may use the language as `_key`)
interface TranslationMetadata {
  _id: string
  translations?: {_key: string; language?: string; value?: {_ref: string}}[]
}

const entryLanguage = (entry: {_key: string; language?: string}) => entry.language ?? entry._key

const translationEntry = (language: string, id: string, type: string, weak: boolean) => ({
  _key: randomUUID().replace(/-/g, ''),
  _type: 'internationalizedArrayReferenceValue',
  language,
  value: {
    _type: 'reference',
    _ref: id,
    // The translation is written asynchronously, so the reference may not resolve yet
    ...(weak && {_weak: true, _strengthenOnPublish: {type}}),
  },
})

export const handler = documentEventHandler<EventData>(async ({context, event}) => {
  const {_id, _type, language} = event.data
  // Second safety net besides the blueprint filter: never translate documents this function wrote.
  // It only ever writes other languages, so checking the language is enough (French documents
  // created by earlier English-based runs have "tr-" IDs and are valid sources now).
  if (language !== BASE_LANGUAGE.id || (SINGLETON_TYPES.includes(_type) && _id !== `${_type}-${BASE_LANGUAGE.id}`)) {
    console.log(`Skipping ${_id}: written by this function`)
    return
  }
  const client = createClient({...context.clientOptions, apiVersion: 'vX', useCdn: false})
  const isSingleton = SINGLETON_TYPES.includes(_type)

  const metadata = isSingleton
    ? null
    : await client.fetch<TranslationMetadata | null>(
        `*[_type == "translation.metadata" && references($id)][0]{_id, translations}`,
        {id: _id},
      )
  const existing = new Map(metadata?.translations?.map((t) => [entryLanguage(t), t.value?._ref]) ?? [])

  // A stray copy of another French document (e.g. left behind by a failed run) is never a source
  const registeredSource = existing.get(BASE_LANGUAGE.id)
  if (registeredSource && registeredSource !== _id) {
    console.log(`Skipping ${_id}: ${registeredSource} is the French source of this group`)
    return
  }

  // Make sure the group exists before translating, so each new translation can be linked as soon
  // as it is created. An interrupted run then never leaves unlinked documents behind.
  let metadataId = metadata?._id
  if (!isSingleton && !metadataId) {
    const created = await client.create({
      _type: 'translation.metadata',
      schemaTypes: [_type],
      translations: [translationEntry(BASE_LANGUAGE.id, _id, _type, false)],
    })
    metadataId = created._id
  } else if (metadataId && !existing.has(BASE_LANGUAGE.id)) {
    await client
      .patch(metadataId)
      .setIfMissing({translations: []})
      .append('translations', [translationEntry(BASE_LANGUAGE.id, _id, _type, false)])
      .commit()
  }

  const sourceSlug = isSingleton
    ? undefined
    : await client.fetch<{_type: 'slug'; current: string} | null>(`*[_id == $id][0].slug`, {id: _id})

  async function translateInto(language: {id: string; title: string}) {
    let targetId = isSingleton ? `${_type}-${language.id}` : existing.get(language.id)
    const isNew = !targetId
    // Generated here (not by Sanity) because the ID is needed to link the translation before
    // it is written. The "tr-" prefix marks it as a translation,
    // which the blueprint filter excludes.
    targetId ??= `tr-${randomUUID()}`
    const writeId = PUBLISH_TRANSLATIONS ? targetId : `drafts.${targetId}`

    // Create the target with its language set before translating. Left to itself, the
    // action first writes a French copy of the source, which matches this function's
    // filter and triggers it again (recursion).
    // A new translation starts with the French slug so it has a URL straight away; editors can
    // then localise it. Later translations never touch the slug or SEO fields (see `target`).
    await client.createIfNotExists({_id: writeId, _type, language: language.id, ...(sourceSlug && {slug: sourceSlug})})
    if (sourceSlug) await client.patch(writeId).setIfMissing({slug: sourceSlug}).commit()
    if (isNew && metadataId) {
      await client
        .patch(metadataId)
        .append('translations', [translationEntry(language.id, targetId, _type, true)])
        .commit()
    }

    await client.agent.action.translate({
      schemaId: SCHEMA_ID,
      documentId: _id,
      targetDocument: {operation: 'edit', _id: writeId},
      languageFieldPath: 'language',
      fromLanguage: BASE_LANGUAGE,
      toLanguage: language,
      forcePublishedWrite: PUBLISH_TRANSLATIONS,
      styleGuide: STYLE_GUIDE,
      // An existing translation keeps its own slug and SEO fields: Translate copies the SEO
      // block from French without translating it, which replaced reviewed English and Spanish
      // titles and descriptions with French ones
      target: {exclude: isNew ? ['slug'] : ['slug', 'seo']},
      // Waits for the translation, so a failure shows up in the function logs. Queued (async)
      // translations failed silently: pages added in October stayed empty in every language.
      async: false,
    })
    return isNew
  }

  let added = 0
  for (let i = 0; i < TARGET_LANGUAGES.length; i += CONCURRENCY) {
    const batch = TARGET_LANGUAGES.slice(i, i + CONCURRENCY)
    const results = await Promise.all(batch.map(translateInto))
    added += results.filter(Boolean).length
  }
  console.log(`Translated ${_id} into ${TARGET_LANGUAGES.length} languages (${added} new)`)
})
