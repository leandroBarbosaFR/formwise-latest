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
  fieldsets: [
    {name: 'monthly', title: 'Monthly billing'},
    {name: 'yearly', title: 'Yearly billing'},
  ],
  fields: [
    languageField,
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    // The site shows the monthly price by default; visitors can switch to yearly
    defineField({
      name: 'monthlyPrice',
      title: 'Monthly price',
      description: 'As displayed, e.g. "29 €". Shown by default. Leave empty if this plan is only sold yearly.',
      type: 'string',
      fieldset: 'monthly',
    }),
    defineField({
      name: 'monthlyPriceDetails',
      title: 'Monthly price details',
      description: 'Small lines under the monthly price, e.g. "per month, billed monthly"',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      fieldset: 'monthly',
    }),
    // Named `price` / `priceDetails` from before the monthly option existed
    defineField({
      name: 'price',
      title: 'Yearly price',
      description: 'As displayed, e.g. "299 €"',
      type: 'string',
      fieldset: 'yearly',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priceDetails',
      title: 'Yearly price details',
      description: 'Small lines under the yearly price, e.g. "That’s 24,92 € per month, billed annually"',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      fieldset: 'yearly',
    }),
    defineField({name: 'description', type: 'string'}),
    defineField({name: 'features', type: 'array', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'featured', title: 'Highlight this plan', type: 'boolean', initialValue: false}),
    defineField({name: 'badge', description: 'e.g. "Most popular"', type: 'string', hidden: ({document}) => !document?.featured}),
    defineField({name: 'cta', title: 'Button', type: 'button'}),
  ],
  preview: {
    select: {title: 'name', monthly: 'monthlyPrice', yearly: 'price'},
    prepare: ({title, monthly, yearly}) => ({
      title,
      subtitle: [monthly && `${monthly} / month`, yearly && `${yearly} / year`].filter(Boolean).join(' · '),
    }),
  },
})
