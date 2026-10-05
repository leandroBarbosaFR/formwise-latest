import {defineField, defineType} from 'sanity'
import {LaunchIcon} from '@sanity/icons/Launch'
import {LinkIcon} from '@sanity/icons/Link'

export const buttonType = defineType({
  name: 'button',
  title: 'Button',
  type: 'object',
  icon: LaunchIcon,
  fields: [
    defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'link', type: 'link'}),
  ],
  preview: {select: {title: 'label'}},
})

export const navItemType = defineType({
  name: 'navItem',
  title: 'Navigation item',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'link', type: 'link', validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'label'}},
})

export const navGroupType = defineType({
  name: 'navGroup',
  title: 'Link group',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'links', type: 'array', of: [{type: 'navItem'}]}),
  ],
  preview: {
    select: {title: 'title', links: 'links'},
    prepare: ({title, links}) => ({title, subtitle: `${links?.length ?? 0} links`}),
  },
})
