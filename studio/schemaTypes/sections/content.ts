import {defineArrayMember, defineField} from 'sanity'
import {CommentIcon} from '@sanity/icons/Comment'
import {CreditCardIcon} from '@sanity/icons/CreditCard'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {BulbOutlineIcon} from '@sanity/icons/BulbOutline'
import {TextIcon} from '@sanity/icons/Text'
import {UsersIcon} from '@sanity/icons/Users'
import {ChartUpwardIcon} from '@sanity/icons/ChartUpward'
import {SplitHorizontalIcon} from '@sanity/icons/SplitHorizontal'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {ThListIcon} from '@sanity/icons/ThList'
import {defineSection} from './helpers'

const heading = defineField({name: 'heading', type: 'string'})
const text = defineField({name: 'text', type: 'text', rows: 3})

export const testimonialsSection = defineSection({
  name: 'testimonialsSection',
  title: 'Testimonials',
  icon: CommentIcon,
  fields: [
    heading,
    text,
    defineField({
      name: 'testimonials',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'testimonial'}]})],
    }),
  ],
})

export const pricingSection = defineSection({
  name: 'pricingSection',
  title: 'Pricing',
  icon: CreditCardIcon,
  fields: [
    heading,
    text,
    defineField({
      name: 'plans',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'plan'}]})],
      validation: (rule) => rule.max(4),
    }),
  ],
})

export const faqSection = defineSection({
  name: 'faqSection',
  title: 'FAQ',
  icon: HelpCircleIcon,
  fields: [
    heading,
    defineField({
      name: 'faqs',
      title: 'Questions',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'faq'}]})],
    }),
  ],
})

export const ctaSection = defineSection({
  name: 'ctaSection',
  title: 'Call to action',
  icon: BulbOutlineIcon,
  fields: [
    defineField({name: 'socialProof', description: 'Short line next to the avatars', type: 'string'}),
    defineField({
      name: 'avatars',
      type: 'array',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      validation: (rule) => rule.max(6),
    }),
    heading,
    text,
    defineField({name: 'primaryCta', title: 'Primary button', type: 'button'}),
    defineField({name: 'secondaryCta', title: 'Secondary button', type: 'button'}),
    defineField({name: 'footnote', type: 'string'}),
  ],
})

export const richTextSection = defineSection({
  name: 'richTextSection',
  title: 'Rich text',
  icon: TextIcon,
  fields: [heading, defineField({name: 'body', type: 'blockContent'})],
})

export const imageTextSection = defineSection({
  name: 'imageTextSection',
  title: 'Image and text',
  icon: SplitHorizontalIcon,
  fields: [
    defineField({name: 'eyebrow', type: 'string'}),
    heading,
    defineField({name: 'body', type: 'blockContent'}),
    defineField({name: 'image', type: 'imageWithAlt'}),
    defineField({
      name: 'imagePosition',
      type: 'string',
      initialValue: 'end',
      options: {
        list: [
          {title: 'Before text', value: 'start'},
          {title: 'After text', value: 'end'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
  ],
})

export const statsSection = defineSection({
  name: 'statsSection',
  title: 'Key figures',
  icon: ChartUpwardIcon,
  fields: [
    heading,
    defineField({
      name: 'items',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'stat',
          type: 'object',
          fields: [
            defineField({name: 'value', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'value', subtitle: 'label'}},
        }),
      ],
    }),
  ],
})

export const teamSection = defineSection({
  name: 'teamSection',
  title: 'Team',
  icon: UsersIcon,
  fields: [
    heading,
    text,
    defineField({
      name: 'members',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'teamMember',
          type: 'object',
          fields: [
            defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'role', type: 'string'}),
            defineField({name: 'photo', type: 'image', options: {hotspot: true}}),
          ],
          preview: {select: {title: 'name', subtitle: 'role', media: 'photo'}},
        }),
      ],
    }),
  ],
})

export const contactSection = defineSection({
  name: 'contactSection',
  title: 'Contact form',
  icon: EnvelopeIcon,
  fields: [
    heading,
    text,
    defineField({
      name: 'formEndpoint',
      description:
        'URL that receives the form (e.g. Formspree, Basin). If empty, the form opens the visitor’s email app instead.',
      type: 'url',
    }),
    defineField({
      name: 'labels',
      title: 'Form labels',
      type: 'object',
      options: {collapsible: true},
      fields: [
        defineField({name: 'name', type: 'string', initialValue: 'Name'}),
        defineField({name: 'email', type: 'string', initialValue: 'Email'}),
        defineField({name: 'organization', type: 'string', initialValue: 'Association'}),
        defineField({name: 'phone', type: 'string', initialValue: 'Phone'}),
        defineField({name: 'address', type: 'string', initialValue: 'Address'}),
        defineField({name: 'message', type: 'string', initialValue: 'Message'}),
        defineField({name: 'submit', type: 'string', initialValue: 'Send message'}),
      ],
    }),
  ],
})

export const postListSection = defineSection({
  name: 'postListSection',
  title: 'Blog posts',
  icon: ThListIcon,
  fields: [
    heading,
    text,
    defineField({
      name: 'category',
      description: 'Optional. Only show posts from this category.',
      type: 'reference',
      to: [{type: 'category'}],
    }),
    defineField({
      name: 'limit',
      description: 'Optional. Leave empty to show every post.',
      type: 'number',
      validation: (rule) => rule.min(1).integer(),
    }),
  ],
})
