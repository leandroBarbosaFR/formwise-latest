import {defineArrayMember, defineField} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'
import {DashboardIcon} from '@sanity/icons/Dashboard'
import {SortIcon} from '@sanity/icons/Sort'
import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {ComponentIcon} from '@sanity/icons/Component'
import {ImagesIcon} from '@sanity/icons/Images'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineSection} from './helpers'

export const heroSection = defineSection({
  name: 'heroSection',
  title: 'Hero',
  icon: HomeIcon,
  fields: [
    defineField({name: 'heading', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'text', type: 'text', rows: 3}),
    defineField({name: 'cta', title: 'Call to action', type: 'button'}),
    defineField({
      name: 'backgroundImage',
      description: 'Sky behind the wordmark',
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'foregroundImage',
      description: 'Transparent cut-out shown in front of the wordmark',
      type: 'imageWithAlt',
    }),
  ],
})

export const pageHeaderSection = defineSection({
  name: 'pageHeaderSection',
  title: 'Page header',
  icon: DocumentTextIcon,
  fields: [
    defineField({name: 'eyebrow', type: 'string'}),
    defineField({name: 'heading', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'text', type: 'text', rows: 3}),
    defineField({name: 'backgroundImage', type: 'imageWithAlt'}),
  ],
})

export const introSection = defineSection({
  name: 'introSection',
  title: 'Introduction',
  icon: DashboardIcon,
  fields: [
    defineField({name: 'eyebrow', type: 'string'}),
    defineField({name: 'heading', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'text', type: 'text', rows: 3}),
    defineField({name: 'secondaryHeading', type: 'string'}),
    defineField({name: 'secondaryText', type: 'text', rows: 3}),
    defineField({
      name: 'showProductPreview',
      description: 'Show the dashboard illustration next to the secondary text',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})

export const wordWheelSection = defineSection({
  name: 'wordWheelSection',
  title: 'Word wheel',
  icon: SortIcon,
  previewField: 'eyebrow',
  fields: [
    defineField({name: 'eyebrow', type: 'string'}),
    defineField({
      name: 'words',
      description: 'Scrolls through the centre of the screen as a loop',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.min(3),
    }),
    defineField({name: 'footnote', type: 'string'}),
  ],
})

export const highlightsSection = defineSection({
  name: 'highlightsSection',
  title: 'Highlights',
  icon: ThLargeIcon,
  previewField: 'items.0.title',
  fields: [
    defineField({
      name: 'items',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'highlight',
          type: 'object',
          fields: [
            defineField({name: 'icon', description: 'SVG, 32×32', type: 'image'}),
            defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'text', type: 'text', rows: 3}),
          ],
          preview: {select: {title: 'title', subtitle: 'text', media: 'icon'}},
        }),
      ],
    }),
  ],
})

export const featureCardsSection = defineSection({
  name: 'featureCardsSection',
  title: 'Feature cards',
  icon: ComponentIcon,
  fields: [
    defineField({name: 'heading', type: 'string'}),
    defineField({name: 'text', type: 'text', rows: 3}),
    defineField({
      name: 'cards',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'featureCard',
          type: 'object',
          // Texts shown inside the animated illustration; empty fields fall back to the English design copy
          fieldsets: [{name: 'panel', title: 'Illustration texts', options: {collapsible: true, collapsed: false}}],
          fields: [
            defineField({
              name: 'illustration',
              type: 'string',
              options: {
                list: [
                  {title: 'Support chat', value: 'support'},
                  {title: 'AI assistant', value: 'assistant'},
                  {title: 'Languages', value: 'languages'},
                  {title: 'Member list', value: 'members'},
                  {title: 'Payment', value: 'payments'},
                  {title: 'Donations', value: 'donations'},
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'text', type: 'text', rows: 3}),
            // Always visible (no conditional `hidden`): automatic translation skips conditional fields
            defineField({
              name: 'panelTitle',
              title: 'Panel title',
              description: 'Support: "Support Formwise" · AI: "Assistant IA" · Languages: "Langues" · Members: "Vos membres" · Payment: "Paiements des adhésions" · Donations: "Dons"',
              type: 'string',
              fieldset: 'panel',
            }),
            defineField({
              name: 'panelLabel',
              title: 'Label',
              description: 'Support: status badge, "En ligne" · Members: status next to each name, "Actif" · Payment: "Payé" · AI, Languages, Donations: not used',
              type: 'string',
              fieldset: 'panel',
            }),
            defineField({
              name: 'panelAmount',
              title: 'Amount',
              description: 'Languages: "24 langues" · Payment: "20,00 €" · Donations: total, "56 000,00 €" · Support, AI, Members: not used',
              type: 'string',
              fieldset: 'panel',
            }),
            defineField({
              name: 'panelDetail',
              title: 'Small line',
              description: 'Support: the member’s question · AI: the request typed to the AI · Languages: "Traduction automatique" · Members: under each name, "Membre depuis 2026" · Donations: "268 donateurs" · Payment: not used',
              type: 'string',
              fieldset: 'panel',
            }),
            defineField({
              name: 'panelReply',
              title: 'Reply',
              description: 'Support: the team’s answer to the question · Other illustrations: not used',
              type: 'string',
              fieldset: 'panel',
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'illustration'}},
        }),
      ],
      validation: (rule) => rule.max(3),
    }),
  ],
})

export const showcaseSection = defineSection({
  name: 'showcaseSection',
  title: 'Image showcase',
  icon: ImagesIcon,
  previewField: 'title',
  fields: [
    defineField({name: 'primaryImage', description: 'Small image with the caption', type: 'imageWithAlt'}),
    defineField({name: 'secondaryImage', description: 'Large image', type: 'imageWithAlt'}),
    defineField({name: 'title', type: 'string'}),
    defineField({name: 'text', type: 'text', rows: 3}),
  ],
})
