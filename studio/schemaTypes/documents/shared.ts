import {defineArrayMember, defineField, defineType} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {CommentIcon} from '@sanity/icons/Comment'
import {CreditCardIcon} from '@sanity/icons/CreditCard'
import {languageField} from '../objects/fields'

export const faqType = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    languageField,
    defineField({name: 'question', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'answer', type: 'blockContent', validation: (rule) => rule.required()}),
    defineField({
      name: 'topic',
      description: 'Optional. Groups questions on the FAQ page.',
      type: 'string',
    }),
  ],
  preview: {select: {title: 'question', subtitle: 'topic'}},
})

export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: CommentIcon,
  fields: [
    languageField,
    defineField({name: 'quote', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'role', description: 'e.g. "President, Association Lumière"', type: 'string'}),
    defineField({
      name: 'rating',
      type: 'number',
      initialValue: 5,
      validation: (rule) => rule.min(1).max(5).integer(),
    }),
  ],
  preview: {select: {title: 'name', subtitle: 'quote'}},
})

export const planType = defineType({
  name: 'plan',
  title: 'Pricing plan',
  type: 'document',
  icon: CreditCardIcon,
  fields: [
    languageField,
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'price', description: 'As displayed, e.g. "299 €"', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'priceDetails',
      description: 'Small lines under the price',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({name: 'description', type: 'string'}),
    defineField({name: 'features', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'featured', title: 'Highlight this plan', type: 'boolean', initialValue: false}),
    defineField({name: 'badge', description: 'e.g. "Most popular"', type: 'string', hidden: ({document}) => !document?.featured}),
    defineField({name: 'cta', title: 'Button', type: 'button'}),
  ],
  preview: {select: {title: 'name', subtitle: 'price'}},
})
