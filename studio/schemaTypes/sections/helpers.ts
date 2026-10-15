import {defineField, defineType, type FieldDefinition} from 'sanity'
import type {ComponentType} from 'react'

// Lets links target a section: `/en/#pricing`
export const anchorField = defineField({
  name: 'anchorId',
  title: 'Section ID',
  description:
    'Optional. Used by links pointing to this section, e.g. "pricing". Keep it the same in every language: it is copied, never translated.',
  type: 'string',
  // Links use the same anchor in every language (`/de/#pricing`), so translations must copy the ID as is.
  // The translate function (Agent Actions) and AI Assist each have their own opt-out.
  options: {documentInternationalization: {exclude: true}, aiAssist: {exclude: true}},
  validation: (rule) =>
    rule.regex(/^[a-z0-9-]+$/, {name: 'lowercase letters, numbers and dashes'}),
})

interface SectionOptions {
  name: string
  title: string
  icon: ComponentType
  fields: FieldDefinition[]
  // Field shown as the item title in the page builder list
  previewField?: string
}

export function defineSection({name, title, icon, fields, previewField = 'heading'}: SectionOptions) {
  return defineType({
    name,
    title,
    type: 'object',
    icon,
    fields: [...fields, anchorField],
    preview: {
      select: {heading: previewField},
      prepare: ({heading}) => ({title: heading || title, subtitle: title, media: icon}),
    },
  })
}
