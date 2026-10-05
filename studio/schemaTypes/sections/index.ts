import {defineArrayMember, defineType} from 'sanity'
import * as marketing from './marketing'
import * as content from './content'

export const sectionTypes = [...Object.values(marketing), ...Object.values(content)]

export const pageBuilderType = defineType({
  name: 'pageBuilder',
  title: 'Sections',
  type: 'array',
  of: sectionTypes.map((section) => defineArrayMember({type: section.name})),
  options: {
    insertMenu: {
      groups: [
        {name: 'headers', title: 'Headers', of: ['heroSection', 'pageHeaderSection']},
        {
          name: 'marketing',
          title: 'Marketing',
          of: ['introSection', 'wordWheelSection', 'highlightsSection', 'featureCardsSection', 'showcaseSection', 'statsSection'],
        },
        {name: 'social', title: 'Social proof', of: ['testimonialsSection', 'teamSection']},
        {name: 'conversion', title: 'Conversion', of: ['pricingSection', 'ctaSection', 'contactSection', 'faqSection']},
        {name: 'content', title: 'Content', of: ['richTextSection', 'imageTextSection', 'postListSection']},
      ],
      views: [{name: 'list'}],
    },
  },
})
