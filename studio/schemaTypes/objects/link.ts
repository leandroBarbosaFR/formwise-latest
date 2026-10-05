import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

export const linkType = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'linkType',
      type: 'string',
      initialValue: 'internal',
      options: {
        list: [
          {title: 'Page or post', value: 'internal'},
          {title: 'Section on a page', value: 'anchor'},
          {title: 'External URL', value: 'external'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'internal',
      title: 'Page or post',
      type: 'reference',
      to: [{type: 'page'}, {type: 'post'}],
      options: {filter: ({document}) => ({filter: 'language == $language', params: {language: document?.language ?? 'en'}})},
      hidden: ({parent}) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'anchor',
      description: 'ID of a section, e.g. "pricing". Combine with a page to link to a section on another page.',
      type: 'string',
      hidden: ({parent}) => parent?.linkType === 'external',
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
      hidden: ({parent}) => parent?.linkType !== 'external',
    }),
    defineField({
      name: 'openInNewTab',
      type: 'boolean',
      initialValue: false,
      hidden: ({parent}) => parent?.linkType !== 'external',
    }),
  ],
})
