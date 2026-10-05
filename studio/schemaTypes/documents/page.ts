import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons/Document'
import {languageField, slugField} from '../objects/fields'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    languageField,
    defineField({name: 'title', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    {...slugField(), group: 'content'},
    defineField({name: 'sections', type: 'pageBuilder', group: 'content'}),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current', language: 'language'},
    prepare: ({title, slug, language}) => ({title, subtitle: `${language?.toUpperCase() ?? ''} · /${slug ?? ''}`}),
  },
})
