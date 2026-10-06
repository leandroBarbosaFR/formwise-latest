import {defineArrayMember, defineField, defineType} from 'sanity'
import {PlugIcon} from '@sanity/icons/Plug'
import {LANGUAGES} from '../../languages'

// Site-wide third-party services. Not translated: one document for every language.
export const integrationsType = defineType({
  name: 'integrations',
  title: 'Integrations',
  type: 'document',
  icon: PlugIcon,
  fields: [
    defineField({
      name: 'googleSiteVerification',
      title: 'Google Search Console verification',
      description: 'Only the content value of the "google-site-verification" meta tag Google gives you.',
      type: 'string',
    }),
    defineField({
      name: 'bingSiteVerification',
      title: 'Bing Webmaster Tools verification',
      description: 'Only the content value of the "msvalidate.01" meta tag.',
      type: 'string',
    }),
    defineField({
      name: 'googleTagManagerId',
      title: 'Google Tag Manager container ID',
      description:
        'e.g. GTM-XXXXXXX. Loaded with every Google consent refused by default; the Axeptio banner (Google Consent Mode v2) grants it when visitors accept.',
      type: 'string',
      validation: (rule) => rule.regex(/^GTM-[A-Z0-9]+$/, {name: 'GTM container ID'}),
    }),
    defineField({
      name: 'axeptio',
      title: 'Axeptio (cookie banner)',
      type: 'object',
      options: {collapsible: false},
      fields: [
        defineField({
          name: 'clientId',
          title: 'Project ID',
          description: 'In Axeptio: your project → Integration. Leave empty to turn the banner off.',
          type: 'string',
        }),
        defineField({
          name: 'cookiesVersions',
          title: 'Banner per language',
          description:
            'The "Cookies version" of each banner. Languages without one use the English banner, then the first one in the list.',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'cookiesVersion',
              type: 'object',
              fields: [
                defineField({
                  name: 'language',
                  type: 'string',
                  options: {list: LANGUAGES.map(({id, title}) => ({title, value: id}))},
                  validation: (rule) => rule.required(),
                }),
                defineField({name: 'version', title: 'Cookies version', type: 'string', validation: (rule) => rule.required()}),
              ],
              preview: {select: {title: 'language', subtitle: 'version'}},
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Integrations'})},
})
