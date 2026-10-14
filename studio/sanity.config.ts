import {defineConfig, type Template} from 'sanity'
import {structureTool} from 'sanity/structure'
import {defineDocuments, presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {documentInternationalization} from '@sanity/document-internationalization'
import {assist} from '@sanity/assist'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {BASE_LANGUAGE, LANGUAGES, LOCALIZED_SINGLETONS, LOCALIZED_TYPES} from './languages'

const LANGUAGE_AWARE_TYPES = [...LOCALIZED_TYPES, ...LOCALIZED_SINGLETONS]

// Website shown in the Presentation tab: the local dev server while working on the Studio locally.
// Switch to https://formwise.fr once the domain points to Vercel.
const SITE_URL = process.env.SANITY_STUDIO_SITE_URL || 'https://formwise-latest.vercel.app'
const LOCAL_SITE_URL = 'http://localhost:4321'

export default defineConfig({
  name: 'default',
  title: 'Formwise',

  projectId: '8c0ffzyk',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    // Shows the website next to the editor; clicking any text opens its field
    presentationTool({
      previewUrl: {
        initial: ({origin}) => (new URL(origin).hostname === 'localhost' ? LOCAL_SITE_URL : SITE_URL),
        // Trailing slash: the website uses one on every URL
        previewMode: {enable: '/api/draft-mode/enable/'},
      },
      allowOrigins: [SITE_URL, LOCAL_SITE_URL],
      resolve: {
        // Opens the matching document when browsing the website in the tab
        mainDocuments: defineDocuments([
          {
            route: '/:lang/blog/:slug/',
            filter: `_type == "post" && language == $lang && slug.current == $slug`,
          },
          {
            route: '/:lang/:slug/',
            filter: `_type == "page" && language == $lang && slug.current == $slug`,
          },
        ]),
      },
    }),
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
