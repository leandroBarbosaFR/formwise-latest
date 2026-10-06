import {defineConfig, type Template} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {documentInternationalization} from '@sanity/document-internationalization'
import {assist} from '@sanity/assist'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {BASE_LANGUAGE, LANGUAGES, LOCALIZED_SINGLETONS, LOCALIZED_TYPES} from './languages'

const LANGUAGE_AWARE_TYPES = [...LOCALIZED_TYPES, ...LOCALIZED_SINGLETONS]

export default defineConfig({
  name: 'default',
  title: 'Formwise',

  projectId: '8c0ffzyk',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    documentInternationalization({
      supportedLanguages: LANGUAGES,
      schemaTypes: LOCALIZED_TYPES,
    }),
    assist({
      translate: {
        styleguide:
          'Formwise is software for associations, clubs and non-profits. Use a warm, clear and professional tone. ' +
          'Keep product names (Formwise) and currency formats unchanged. Use the formal form of address where the language has one.',
        document: {languageField: 'language', documentTypes: LANGUAGE_AWARE_TYPES},
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // `<type>-language` creates a document with its language preset, used by the structure lists
    templates: (prev): Template[] => [
      ...prev.filter((template) => !LANGUAGE_AWARE_TYPES.includes(template.schemaType)),
      ...LANGUAGE_AWARE_TYPES.map((schemaType) => ({
        id: `${schemaType}-language`,
        title: schemaType,
        schemaType,
        parameters: [{name: 'language', type: 'string'}],
        value: ({language}: {language: string}) => ({language}),
      })),
    ],
  },

  document: {
    // The global "Create" menu creates base-language documents; translations come from the plugin
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type !== 'global') return prev
      return [
        // Integrations is a singleton, opened from the structure only
        ...prev.filter((item) => !LANGUAGE_AWARE_TYPES.includes(item.templateId) && item.templateId !== 'integrations'),
        ...LOCALIZED_TYPES.map((schemaType) => ({
          templateId: `${schemaType}-language`,
          parameters: {language: BASE_LANGUAGE},
        })),
      ]
    },
  },
})
