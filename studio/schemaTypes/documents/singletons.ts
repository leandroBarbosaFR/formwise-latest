import {defineArrayMember, defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'
import {MenuIcon} from '@sanity/icons/Menu'
import {BlockElementIcon} from '@sanity/icons/BlockElement'
import {languageField} from '../objects/fields'

const languagePreview = (title: string) => ({
  select: {language: 'language'},
  prepare: ({language}: {language?: string}) => ({title, subtitle: language?.toUpperCase()}),
})

export const settingsType = defineType({
  name: 'settings',
  title: 'General settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'general', title: 'General', default: true},
    {name: 'contact', title: 'Contact'},
    {name: 'strings', title: 'Interface text'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    languageField,
    defineField({name: 'siteName', type: 'string', group: 'general', validation: (rule) => rule.required()}),
    defineField({name: 'siteDescription', type: 'text', rows: 3, group: 'general'}),
    defineField({
      name: 'homePage',
      type: 'reference',
      to: [{type: 'page'}],
      group: 'general',
      options: {filter: ({document}) => ({filter: 'language == $language', params: {language: document?.language}})},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'blogPage',
      description: 'Page shown at /blog. Add a "Blog posts" section to list the posts.',
      type: 'reference',
      to: [{type: 'page'}],
      group: 'general',
      options: {filter: ({document}) => ({filter: 'language == $language', params: {language: document?.language}})},
    }),
    defineField({name: 'email', type: 'string', group: 'contact', validation: (rule) => rule.email()}),
    defineField({name: 'phone', type: 'string', group: 'contact'}),
    defineField({name: 'address', type: 'text', rows: 3, group: 'contact'}),
    defineField({
      name: 'socialLinks',
      type: 'array',
      group: 'contact',
      of: [
        defineArrayMember({
          name: 'socialLink',
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              type: 'string',
              options: {list: ['LinkedIn', 'Instagram', 'Facebook', 'X', 'YouTube', 'TikTok']},
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'url', type: 'url', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'platform', subtitle: 'url'}},
        }),
      ],
    }),
    defineField({
      name: 'strings',
      title: 'Interface text',
      description: 'Small pieces of text used across the website',
      type: 'object',
      group: 'strings',
      fields: [
        defineField({name: 'readMore', type: 'string', initialValue: 'Read article'}),
        defineField({name: 'backToBlog', type: 'string', initialValue: 'Back to blog'}),
        defineField({name: 'publishedOn', type: 'string', initialValue: 'Published'}),
        defineField({name: 'minutesRead', description: 'Use {minutes} for the number', type: 'string', initialValue: '{minutes} min read'}),
        defineField({name: 'relatedPosts', type: 'string', initialValue: 'Keep reading'}),
        defineField({name: 'allCategories', type: 'string', initialValue: 'All'}),
        defineField({name: 'noPosts', type: 'string', initialValue: 'No articles yet.'}),
        defineField({name: 'language', title: 'Language switcher label', type: 'string', initialValue: 'Language'}),
        defineField({name: 'menu', title: 'Menu button label', type: 'string', initialValue: 'Menu'}),
        defineField({name: 'close', title: 'Close button label', type: 'string', initialValue: 'Close'}),
        defineField({name: 'backToTop', type: 'string', initialValue: 'Back to top'}),
        defineField({name: 'skipToContent', type: 'string', initialValue: 'Skip to content'}),
        defineField({name: 'notFoundTitle', type: 'string', initialValue: 'Page not found'}),
        defineField({name: 'notFoundText', type: 'string', initialValue: 'The page you are looking for doesn’t exist or has moved.'}),
        defineField({name: 'backHome', type: 'string', initialValue: 'Back to home'}),
        defineField({name: 'formSuccess', type: 'string', initialValue: 'Thanks! We’ll get back to you shortly.'}),
      ],
    }),
    defineField({name: 'seo', title: 'Default SEO', type: 'seo', group: 'seo'}),
  ],
  preview: languagePreview('General settings'),
})

export const headerType = defineType({
  name: 'header',
  title: 'Header',
  type: 'document',
  icon: MenuIcon,
  fields: [
    languageField,
    defineField({name: 'navigation', type: 'array', of: [defineArrayMember({type: 'navItem'})]}),
    defineField({name: 'loginButton', type: 'button'}),
    defineField({name: 'ctaButton', title: 'Call to action', type: 'button'}),
  ],
  preview: languagePreview('Header'),
})

export const footerType = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  icon: BlockElementIcon,
  groups: [
    {name: 'cta', title: 'Call to action', default: true},
    {name: 'links', title: 'Links'},
  ],
  fields: [
    languageField,
    defineField({name: 'ctaHeading', title: 'Heading', type: 'string', group: 'cta'}),
    defineField({name: 'ctaText', title: 'Text', type: 'text', rows: 2, group: 'cta'}),
    defineField({name: 'ctaPrimary', title: 'Primary button', type: 'button', group: 'cta'}),
    defineField({name: 'ctaSecondary', title: 'Secondary button', type: 'button', group: 'cta'}),
    defineField({name: 'tagline', description: 'Shown under the logo', type: 'text', rows: 2, group: 'links'}),
    defineField({name: 'columns', title: 'Link columns', type: 'array', of: [defineArrayMember({type: 'navGroup'})], group: 'links', validation: (rule) => rule.max(4)}),
    defineField({
      name: 'copyright',
      description: 'Use {year} for the current year',
      type: 'string',
      initialValue: '© {year} Formwise. All rights reserved.',
      group: 'links',
    }),
  ],
  preview: languagePreview('Footer'),
})
