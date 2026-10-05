import {defineField, defineType} from 'sanity'
import {SearchIcon} from '@sanity/icons/Search'

export const seoType = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'title',
      description: 'Shown in search results and browser tabs. Falls back to the document title.',
      type: 'string',
      validation: (rule) => rule.max(70).warning('Search engines usually cut titles after ~60 characters'),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(170).warning('Search engines usually cut descriptions after ~155 characters'),
    }),
    defineField({name: 'image', title: 'Social sharing image', type: 'image'}),
    defineField({name: 'noIndex', title: 'Hide from search engines', type: 'boolean', initialValue: false}),
  ],
})
