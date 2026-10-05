import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

export const imageWithAltType = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      description: 'Describe the image for screen readers. Leave empty for purely decorative images.',
      type: 'string',
    }),
  ],
})
