import type {ComponentType} from 'react'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import {MenuIcon} from '@sanity/icons/Menu'
import {BlockElementIcon} from '@sanity/icons/BlockElement'
import {ControlsIcon} from '@sanity/icons/Controls'
import {DocumentIcon} from '@sanity/icons/Document'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {TagIcon} from '@sanity/icons/Tag'
import {UserIcon} from '@sanity/icons/User'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {CommentIcon} from '@sanity/icons/Comment'
import {CreditCardIcon} from '@sanity/icons/CreditCard'
import {StackIcon} from '@sanity/icons/Stack'
import {BASE_LANGUAGE, LANGUAGES} from './languages'

const languageLabel = (id: string, title: string) => `${title} (${id.toUpperCase()})`

// One fixed-ID document per language, e.g. `header-fr`
function localizedSingleton(S: StructureBuilder, type: string, title: string, icon: ComponentType) {
  return S.listItem()
    .id(type)
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .title(title)
        .items(
          LANGUAGES.map(({id, title: languageTitle}) =>
            S.listItem()
              .id(`${type}-${id}`)
              .title(languageLabel(id, languageTitle))
              .icon(icon)
              .child(
                S.document()
                  .schemaType(type)
                  .documentId(`${type}-${id}`)
                  .initialValueTemplate(`${type}-language`, {language: id})
                  .title(`${title} · ${languageTitle}`),
              ),
          ),
        ),
    )
}

// Documents of one type, grouped by language
function localizedList(S: StructureBuilder, type: string, title: string, icon: ComponentType) {
  const listFor = (language: string, listTitle: string) =>
    S.documentTypeList(type)
      .title(listTitle)
      .filter('_type == $type && language == $language')
      .params({type, language})
      .initialValueTemplates([S.initialValueTemplateItem(`${type}-language`, {language})])

  return S.listItem()
    .id(type)
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .title(title)
        .items([
          S.listItem()
            .id(`${type}-${BASE_LANGUAGE}`)
            .title(languageLabel(BASE_LANGUAGE, 'English'))
            .icon(icon)
            .child(listFor(BASE_LANGUAGE, `${title} · English`)),
          S.divider(),
          ...LANGUAGES.filter(({id}) => id !== BASE_LANGUAGE).map(({id, title: languageTitle}) =>
            S.listItem()
              .id(`${type}-${id}`)
              .title(languageLabel(id, languageTitle))
              .icon(icon)
              .child(listFor(id, `${title} · ${languageTitle}`)),
          ),
        ]),
    )
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      localizedSingleton(S, 'settings', 'General management', ControlsIcon),
      localizedSingleton(S, 'header', 'Header', MenuIcon),
      localizedSingleton(S, 'footer', 'Footer', BlockElementIcon),
      S.divider(),
      localizedList(S, 'page', 'Pages', DocumentIcon),
      S.divider(),
      S.listItem()
        .id('blog')
        .title('Blog')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('Blog')
            .items([
              localizedList(S, 'post', 'Posts', DocumentTextIcon),
              localizedList(S, 'category', 'Categories', TagIcon),
              localizedList(S, 'author', 'Authors', UserIcon),
            ]),
        ),
      S.listItem()
        .id('shared')
        .title('Shared content')
        .icon(StackIcon)
        .child(
          S.list()
            .title('Shared content')
            .items([
              localizedList(S, 'faq', 'FAQs', HelpCircleIcon),
              localizedList(S, 'testimonial', 'Testimonials', CommentIcon),
              localizedList(S, 'plan', 'Pricing plans', CreditCardIcon),
            ]),
        ),
    ])
