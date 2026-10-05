import {linkType} from './objects/link'
import {buttonType, navGroupType, navItemType} from './objects/button'
import {seoType} from './objects/seo'
import {blockContentType} from './objects/blockContent'
import {imageWithAltType} from './objects/imageWithAlt'
import {pageBuilderType, sectionTypes} from './sections'
import {footerType, headerType, settingsType} from './documents/singletons'
import {pageType} from './documents/page'
import {authorType, categoryType, postType} from './documents/blog'
import {faqType, planType, testimonialType} from './documents/shared'

export const schemaTypes = [
  // Documents
  settingsType,
  headerType,
  footerType,
  pageType,
  postType,
  categoryType,
  authorType,
  faqType,
  testimonialType,
  planType,
  // Objects
  linkType,
  buttonType,
  navItemType,
  navGroupType,
  seoType,
  blockContentType,
  imageWithAltType,
  pageBuilderType,
  ...sectionTypes,
]
