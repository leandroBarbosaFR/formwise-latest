import {defineArrayMember, defineField, defineType, type ReferenceFilterResolver} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {TagIcon} from '@sanity/icons/Tag'
import {UserIcon} from '@sanity/icons/User'
import {languageField, slugField} from '../objects/fields'

const sameLanguage: ReferenceFilterResolver = ({document}) => ({
  filter: 'language == $language',
  params: {language: document?.language ?? 'en'},
})

export const postType = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'meta', title: 'Details'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    languageField,
    defineField({name: 'title', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    {...slugField(), group: 'content'},
    defineField({
      name: 'excerpt',
      description: 'Shown on the blog index and in search results',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.max(220),
    }),
    defineField({name: 'coverImage', type: 'imageWithAlt', group: 'content'}),
    defineField({name: 'body', type: 'blockContent', group: 'content'}),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'author', type: 'reference', to: [{type: 'author'}], group: 'meta', options: {filter: sameLanguage}}),
    defineField({
      name: 'categories',
      type: 'array',
      group: 'meta',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}], options: {filter: sameLanguage}})],
    }),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  orderings: [{title: 'Newest first', name: 'publishedDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'title', language: 'language', date: 'publishedAt', media: 'coverImage'},
    prepare: ({title, language, date, media}) => ({
      title,
      subtitle: [language?.toUpperCase(), date?.slice(0, 10)].filter(Boolean).join(' · '),
      media,
    }),
  },
})

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    languageField,
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    slugField(),
    defineField({name: 'description', type: 'text', rows: 2}),
  ],
  preview: {select: {title: 'title', subtitle: 'language'}},
})

export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    languageField,
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'role', type: 'string'}),
    defineField({name: 'image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'bio', type: 'text', rows: 3}),
  ],
  preview: {select: {title: 'name', subtitle: 'role', media: 'image'}},
})
