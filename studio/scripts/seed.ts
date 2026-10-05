/**
 * Seeds the dataset with the English website content.
 *
 *   npx sanity exec scripts/seed.ts --with-user-token
 *
 * Runs once: it stops if English settings already exist. Translations are created
 * afterwards by the `translate` Sanity Function (or "Translate document" in the Studio).
 */
import {randomUUID} from 'node:crypto'
import {createReadStream} from 'node:fs'
import {basename, resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-10-05'})
const ASSETS = resolve(process.cwd(), '../web/public/figma')
const LANGUAGE = 'en'

const key = () => randomUUID().slice(0, 12)
const ref = (id: string) => ({_type: 'reference', _ref: id})
const refItem = (id: string) => ({...ref(id), _key: key()})

async function upload(file: string) {
  const asset = await client.assets.upload('image', createReadStream(`${ASSETS}/${file}`), {
    filename: basename(file),
  })
  console.log(`  ↑ ${file}`)
  return asset._id
}

const image = (assetId: string, extra: Record<string, unknown> = {}) => ({
  _type: 'imageWithAlt',
  asset: ref(assetId),
  ...extra,
})

// Crop + hotspot as fractions of the original image, matching the framing in Figma
const framed = (crop: {top: number; bottom: number; left: number; right: number}) => ({
  crop: {_type: 'sanity.imageCrop', ...crop},
  hotspot: {
    _type: 'sanity.imageHotspot',
    x: crop.left + (1 - crop.left - crop.right) / 2,
    y: crop.top + (1 - crop.top - crop.bottom) / 2,
    width: 1 - crop.left - crop.right,
    height: 1 - crop.top - crop.bottom,
  },
})

const block = (text: string, style = 'normal') => ({
  _type: 'block',
  _key: key(),
  style,
  markDefs: [],
  children: [{_type: 'span', _key: key(), text, marks: []}],
})
const bullets = (items: string[]) =>
  items.map((text) => ({...block(text), listItem: 'bullet', level: 1}))

type Link =
  | {internal: string; anchor?: string}
  | {anchor: string; internal?: string}
  | {url: string}
const link = (target: Link) =>
  'url' in target
    ? {_type: 'link', linkType: 'external', url: target.url}
    : {
        _type: 'link',
        linkType: target.anchor ? 'anchor' : 'internal',
        ...(target.internal && {internal: ref(target.internal)}),
        ...(target.anchor && {anchor: target.anchor}),
      }
const button = (label: string, target: Link) => ({_type: 'button', label, link: link(target)})
const navItem = (label: string, target: Link) => ({_type: 'navItem', _key: key(), label, link: link(target)})

async function create(doc: Record<string, unknown>) {
  const created = await client.create({language: LANGUAGE, ...doc} as never)
  console.log(`  + ${doc._type}: ${created._id}`)
  return created._id
}

async function seed() {
  const existing = await client.fetch(`*[_id == "settings-en"][0]._id`)
  if (existing) {
    console.log('English settings already exist, nothing to do.')
    return
  }

  console.log('Uploading images…')
  const assets = {
    sky: await upload('hero-bg-2.png'),
    arch: await upload('hero-arch.png'),
    temple: await upload('showcase-temple.png'),
    woman: await upload('showcase-woman.png'),
    gridIcon: await upload('grid-four.svg'),
    blurBlue: await upload('feat-blur-1.jpg'),
    blurWarm: await upload('feat-blur-2.jpg'),
    blurDusk: await upload('feat-blur-3.jpg'),
    avatars: [
      await upload('avatar-121.png'),
      await upload('avatar-122.png'),
      await upload('avatar-123.png'),
      await upload('avatar-124.png'),
      await upload('avatar-125.png'),
    ],
  }

  console.log('Creating shared content…')
  const testimonials = [
    await create({
      _type: 'testimonial',
      quote: 'Since adopting Formwise, memberships take half the time. The dashboard gives me a clear view of everything happening in the association.',
      name: 'Sophie Martin',
      role: 'President, Association Lumière',
      rating: 5,
    }),
    await create({
      _type: 'testimonial',
      quote: 'I love how easy it is to track my documents and pay my dues. The notifications keep me informed without being overwhelming.',
      name: 'Ahmed Benali',
      role: 'Member, Association Lumière',
      rating: 5,
    }),
    await create({
      _type: 'testimonial',
      quote: 'Attendance at activities, communication with members — everything is in one place. It has genuinely simplified my volunteering.',
      name: 'Claire Dupont',
      role: 'Volunteer, Club Saint-Exupéry',
      rating: 5,
    }),
  ]

  const faqs = [
    await create({
      _type: 'faq',
      topic: 'Getting started',
      question: 'How long does it take to set up Formwise?',
      answer: [block('Most associations are up and running in an afternoon. Import your member list from a spreadsheet, set your membership fees, and invite your board. Our team can help you migrate data on the Pro plan.')],
    }),
    await create({
      _type: 'faq',
      topic: 'Getting started',
      question: 'Can I try Formwise before paying?',
      answer: [block('Yes. Every plan comes with a 15-day free trial with all features included. No credit card is required, and you can cancel at any time.')],
    }),
    await create({
      _type: 'faq',
      topic: 'Payments',
      question: 'How do members pay their dues?',
      answer: [block('Members receive a secure payment link by email and can pay online by card or bank transfer. Payments are matched to members automatically, and reminders are sent for anything outstanding.')],
    }),
    await create({
      _type: 'faq',
      topic: 'Security',
      question: 'Where is our data stored?',
      answer: [block('All data is hosted in the European Union and processed in line with the GDPR. You stay the owner of your data and can export it whenever you like.')],
    }),
    await create({
      _type: 'faq',
      topic: 'Team',
      question: 'Can several board members use the same account?',
      answer: [block('Yes. Invite your board and volunteers, and give each person the access they need — from full administration to read-only views of their own activities.')],
    }),
    await create({
      _type: 'faq',
      topic: 'Plans',
      question: 'What happens if our association grows?',
      answer: [block('You can change plans at any time. When you move to a larger plan, the price difference is calculated pro rata for the rest of your billing year.')],
    }),
  ]

  console.log('Creating pages…')
  // Created first so other documents can link to them
  const homeId = await create({_type: 'page', title: 'Home', slug: {_type: 'slug', current: 'home'}})
  const aboutId = await create({_type: 'page', title: 'About us', slug: {_type: 'slug', current: 'about'}})
  const contactId = await create({_type: 'page', title: 'Contact', slug: {_type: 'slug', current: 'contact'}})
  const faqId = await create({_type: 'page', title: 'FAQ', slug: {_type: 'slug', current: 'faq'}})
  const blogId = await create({_type: 'page', title: 'Blog', slug: {_type: 'slug', current: 'blog'}})

  const trialButton = button('Try free for 15 days', {internal: contactId})
  const standardFeatures = [
    'Up to 150 active members',
    'Online memberships and registrations',
    'Dues and payment tracking',
    'Automatic reminders',
    'Centralized documents',
    'Targeted communications',
    'Access for the board and volunteers',
    'Support response within 1 business day',
  ]
  const planBase = {
    _type: 'plan',
    description: 'For small associations that want to centralize their management.',
    cta: trialButton,
  }
  const plans = [
    await create({...planBase, name: 'Free', price: '$0', priceDetails: ['That’s 33,25 € per month, billed annually', '2 months free · Save 79,80 € per year'], features: standardFeatures}),
    await create({...planBase, name: 'Starter', price: '299 €', priceDetails: ['That’s 33,25 € per month, billed annually', '2 months free · Save 79,80 € per year'], features: standardFeatures}),
    await create({...planBase, name: 'Essential', price: '399 €', priceDetails: ['That’s 33,25 € per month, billed annually', '2 months free · Save 79,80 € per year'], features: standardFeatures, featured: true, badge: 'Most popular'}),
    await create({
      ...planBase,
      name: 'Pro',
      price: '699 €',
      priceDetails: ['That’s 58,25 € per month, billed annually', '2 months free · Save 139,80 € per year'],
      features: ['More than 600 active members', 'Deployment support', 'Data import and migration', 'Custom configuration', 'Advanced role management', 'Enhanced availability commitment', 'Dedicated support', 'Specific features and integrations'],
    }),
  ]

  console.log('Creating blog content…')
  const authorId = await create({
    _type: 'author',
    name: 'Léa Moreau',
    role: 'Community lead, Formwise',
    image: {_type: 'image', asset: ref(assets.avatars[4])},
    bio: 'Léa has spent ten years volunteering for sports clubs and cultural associations, and now helps them get more from Formwise.',
  })
  const guidesId = await create({_type: 'category', title: 'Guides', slug: {_type: 'slug', current: 'guides'}})
  const newsId = await create({_type: 'category', title: 'Product news', slug: {_type: 'slug', current: 'product-news'}})

  const day = 24 * 60 * 60 * 1000
  await create({
    _type: 'post',
    title: 'Five ways to spend less time on membership admin',
    slug: {_type: 'slug', current: 'less-time-on-membership-admin'},
    excerpt: 'Renewals, reminders and spreadsheets eat into the time you’d rather spend on your members. Here’s how to get it back.',
    coverImage: image(assets.blurBlue, {alt: ''}),
    publishedAt: new Date(Date.now() - 3 * day).toISOString(),
    author: ref(authorId),
    categories: [refItem(guidesId)],
    body: [
      block('Most volunteers don’t join an association to manage spreadsheets. Yet membership admin quietly takes up evenings and weekends. These five habits make a real difference.'),
      block('1. Keep one source of truth', 'h2'),
      block('When member details live in several spreadsheets and inboxes, every update has to be made twice. Bring everything into one list that the whole board can see.'),
      block('2. Let renewals run themselves', 'h2'),
      block('Set your membership periods once and send renewal links automatically. Members pay online, and their status updates without anyone having to check a bank statement.'),
      block('3. Automate the reminders', 'h2'),
      block('Friendly, automatic reminders are more consistent than personal follow-ups — and nobody has to be the one chasing late payments.'),
      block('4. Share the work', 'h2'),
      block('Give volunteers access to exactly what they need: event organisers see registrations, treasurers see payments.'),
      block('5. Review once a month', 'h2'),
      block('A short monthly look at the dashboard is enough to spot unpaid dues, upcoming renewals and quiet members who might need a nudge.'),
    ],
  })
  await create({
    _type: 'post',
    title: 'A practical guide to GDPR for small associations',
    slug: {_type: 'slug', current: 'gdpr-guide-for-associations'},
    excerpt: 'What data you can keep, how long to keep it and how to answer member requests — without a legal department.',
    coverImage: image(assets.blurWarm, {alt: ''}),
    publishedAt: new Date(Date.now() - 12 * day).toISOString(),
    author: ref(authorId),
    categories: [refItem(guidesId)],
    body: [
      block('Associations handle personal data every day: names, addresses, payment details, sometimes health information for sports activities. The GDPR applies to all of it, whatever your size.'),
      block('Collect only what you need', 'h2'),
      block('For each piece of information, ask whether you really use it. A membership form rarely needs a date of birth unless your activities depend on age.'),
      block('Be clear about why', 'h2'),
      block('Tell members what you collect and why in plain language, ideally on the form itself.'),
      block('Know how to answer requests', 'h2'),
      ...bullets([
        'Access: send members a copy of the data you hold about them.',
        'Correction: let members update their own details.',
        'Deletion: remove data you no longer need, except where the law requires you to keep it.',
      ]),
      block('This article is general guidance, not legal advice. For specific situations, contact your national data protection authority.'),
    ],
  })
  await create({
    _type: 'post',
    title: 'Formwise now speaks all 24 EU languages',
    slug: {_type: 'slug', current: 'formwise-in-24-languages'},
    excerpt: 'Members can now register, pay and receive messages in their own language, from Irish to Maltese.',
    coverImage: image(assets.blurDusk, {alt: ''}),
    publishedAt: new Date(Date.now() - 20 * day).toISOString(),
    author: ref(authorId),
    categories: [refItem(newsId)],
    body: [
      block('Many associations bring together people who don’t share a first language. From today, every member-facing page in Formwise is available in all 24 official languages of the European Union.'),
      block('What changes for your members', 'h2'),
      block('Registration forms, payment pages and emails automatically use each member’s preferred language. Members can change it at any time from their profile.'),
      block('What changes for your board', 'h2'),
      block('Nothing to configure. Your dashboard stays in the language you choose, and messages you write can be translated before they are sent.'),
    ],
  })

  console.log('Filling pages…')
  const ctaSection = {
    _type: 'ctaSection',
    _key: key(),
    socialProof: 'Loved by presidents, treasurers and volunteers',
    avatars: assets.avatars.map((id) => ({_type: 'image', _key: key(), asset: ref(id)})),
    heading: 'Bring your whole association together in one place',
    text: 'Set up your members, dues and events in minutes. Try every feature free for 15 days, then pick the plan that fits.',
    primaryCta: button('Start your free trial', {internal: homeId, anchor: 'pricing'}),
    secondaryCta: button('Book a demo', {internal: contactId}),
    footnote: 'No credit card required · Cancel anytime',
  }
  const pageHeader = (eyebrow: string, heading: string, text: string) => ({
    _type: 'pageHeaderSection',
    _key: key(),
    eyebrow,
    heading,
    text,
  })

  await client
    .patch(homeId)
    .set({
      seo: {_type: 'seo', title: 'Everything your association needs', description: 'Manage members, payments, documents, and communication from one platform that saves time and simplifies daily operations.'},
      sections: [
        {
          _type: 'heroSection',
          _key: key(),
          heading: 'Everything your association needs. All in one place.',
          text: 'Manage members, payments, documents, and communication from one platform that saves time and simplifies daily operations.',
          cta: button('Start your free trial', {internal: homeId, anchor: 'pricing'}),
          backgroundImage: image(assets.sky, {alt: ''}),
          foregroundImage: image(assets.arch, {alt: 'Roman triumphal arch under a blue sky'}),
        },
        {
          _type: 'introSection',
          _key: key(),
          eyebrow: 'Introduction',
          heading: 'Everything organized. Nothing falling through the cracks.',
          text: 'One platform to manage your members, payments, documents, registrations, and communication, so less time goes into admin and more time goes into running your organization.',
          secondaryHeading: 'One dashboard for the whole board.',
          secondaryText: 'See memberships, events, payments and finances at a glance, and know exactly what needs your attention today.',
          showProductPreview: true,
        },
        {
          _type: 'wordWheelSection',
          _key: key(),
          eyebrow: 'Control',
          words: ['Memberships', 'Due Payments', 'Donations', 'Events', 'Finances'],
          footnote: 'And much more. In one platform.',
        },
        {
          _type: 'highlightsSection',
          _key: key(),
          items: [
            ['Member directory', 'Get a clear view of your members and easily manage their information, status, and associations.'],
            ['Online payments', 'Collect dues and donations online and match every payment to the right member automatically.'],
            ['Events and registrations', 'Publish events, take registrations and keep track of who is coming in seconds.'],
            ['Secure documents', 'Store statutes, minutes and receipts in one place, with access for the right people only.'],
          ].map(([title, text]) => ({_type: 'highlight', _key: key(), icon: {_type: 'image', asset: ref(assets.gridIcon)}, title, text})),
        },
        {
          _type: 'featureCardsSection',
          _key: key(),
          anchorId: 'features',
          heading: 'Everything organized. Nothing falling through the cracks.',
          text: 'One platform to manage your members, payments, documents, registrations, and communication, so less time goes into admin and more time goes into running your organization.',
          cards: [
            {_type: 'featureCard', _key: key(), illustration: 'members', title: 'Stay on top of your membership', text: 'Get a clear view of your members and easily manage their information, status, and associations.'},
            {_type: 'featureCard', _key: key(), illustration: 'payments', title: 'Simplify your membership payments', text: 'Keep track of monthly fees, payments, and outstanding amounts in one place.'},
            {_type: 'featureCard', _key: key(), illustration: 'donations', title: 'Keep donations organized', text: 'Track incoming donations, manage campaigns, and keep receipts ready when you need them.'},
          ],
        },
        {
          _type: 'showcaseSection',
          _key: key(),
          primaryImage: image(assets.temple, {alt: 'Ancient temple columns under a blue sky', ...framed({top: 0.298, bottom: 0, left: 0.307, right: 0})}),
          secondaryImage: image(assets.woman, {alt: 'Woman working at a computer', ...framed({top: 0.095, bottom: 0.161, left: 0.2745, right: 0.274})}),
          title: 'Built to last, like the best institutions',
          text: 'Formwise keeps your association’s history, members and finances safe, so the next board can pick up exactly where you left off.',
        },
        {
          _type: 'testimonialsSection',
          _key: key(),
          heading: 'Trusted by associations across the country',
          text: 'Discover how Formwise helps presidents, members and volunteers every day.',
          testimonials: testimonials.map(refItem),
        },
        {
          _type: 'pricingSection',
          _key: key(),
          anchorId: 'pricing',
          heading: 'Pricing that fits the size of your association',
          text: 'Choose the plan that matches your number of members and centralize your memberships, dues and communication without juggling multiple tools.',
          plans: plans.map(refItem),
        },
        {_type: 'faqSection', _key: key(), anchorId: 'faq', heading: 'Frequently Asked Questions', faqs: faqs.map(refItem)},
        ctaSection,
      ],
    })
    .commit()

  await client
    .patch(aboutId)
    .set({
      seo: {_type: 'seo', description: 'Formwise is built by people who have run associations themselves, to give volunteers their evenings back.'},
      sections: [
        pageHeader('About us', 'Built by people who run associations', 'We started Formwise after years of managing clubs and non-profits with spreadsheets, shared inboxes and good intentions.'),
        {
          _type: 'imageTextSection',
          _key: key(),
          eyebrow: 'Our story',
          heading: 'Giving volunteers their evenings back',
          body: [
            block('Every association depends on people who give their free time. Too often, that time disappears into renewals, payment reminders and lost documents.'),
            block('Formwise brings everything an association needs into one calm, well-designed place, so boards can focus on their members and their mission.'),
          ],
          image: image(assets.temple, {alt: 'Ancient temple columns under a blue sky'}),
          imagePosition: 'end',
        },
        {
          _type: 'statsSection',
          _key: key(),
          heading: 'Formwise at a glance',
          items: [
            ['24', 'EU languages supported'],
            ['15 days', 'Free trial on every plan'],
            ['4', 'Plans for every size'],
            ['1', 'Platform for everything'],
          ].map(([value, label]) => ({_type: 'stat', _key: key(), value, label})),
        },
        {
          _type: 'teamSection',
          _key: key(),
          heading: 'The team',
          text: 'A small team of designers, engineers and former association presidents.',
          members: [
            ['Julien Amare', 'Co-founder & CEO', 0],
            ['Claire Bernard', 'Co-founder & Product', 1],
            ['Marie Dupont', 'Engineering', 2],
            ['Jean Dupuis', 'Customer success', 3],
          ].map(([name, role, i]) => ({_type: 'teamMember', _key: key(), name, role, photo: {_type: 'image', asset: ref(assets.avatars[i as number])}})),
        },
        ctaSection,
      ],
    })
    .commit()

  await client
    .patch(contactId)
    .set({
      seo: {_type: 'seo', description: 'Questions about Formwise or need a demo? Get in touch with our team.'},
      sections: [
        pageHeader('Contact', 'Let’s talk about your association', 'Questions, a demo, or help moving your data? We usually reply within one business day.'),
        {
          _type: 'contactSection',
          _key: key(),
          heading: 'Send us a message',
          text: 'Tell us a little about your association and what you’re looking for, and we’ll get back to you shortly.',
          labels: {name: 'Name', email: 'Email', organization: 'Association', phone: 'Phone', address: 'Address', message: 'Message', submit: 'Send message'},
        },
        {_type: 'faqSection', _key: key(), heading: 'Before you write', faqs: faqs.slice(0, 3).map(refItem)},
      ],
    })
    .commit()

  await client
    .patch(faqId)
    .set({
      seo: {_type: 'seo', description: 'Answers to the most common questions about Formwise.'},
      sections: [
        pageHeader('FAQ', 'Frequently asked questions', 'Everything you need to know about getting started, payments, security and plans.'),
        {_type: 'faqSection', _key: key(), heading: 'Your questions, answered', faqs: faqs.map(refItem)},
        ctaSection,
      ],
    })
    .commit()

  await client
    .patch(blogId)
    .set({
      seo: {_type: 'seo', description: 'Guides and news to help associations run smoothly.'},
      sections: [
        pageHeader('Blog', 'Ideas for running a better association', 'Practical guides, product news and stories from associations using Formwise.'),
        {_type: 'postListSection', _key: key()},
      ],
    })
    .commit()

  console.log('Creating settings, header and footer…')
  const pricing = {internal: homeId, anchor: 'pricing'}
  await client.createIfNotExists({
    _id: 'settings-en',
    _type: 'settings',
    language: LANGUAGE,
    siteName: 'Formwise',
    siteDescription: 'Manage members, payments, documents, and communication from one platform that saves time and simplifies daily operations.',
    homePage: ref(homeId),
    blogPage: ref(blogId),
    email: 'hello@example.com',
    strings: {
      readMore: 'Read article',
      backToBlog: 'Back to blog',
      publishedOn: 'Published',
      minutesRead: '{minutes} min read',
      relatedPosts: 'Keep reading',
      allCategories: 'All',
      noPosts: 'No articles yet.',
      language: 'Language',
      menu: 'Menu',
      backToTop: 'Back to top',
      skipToContent: 'Skip to content',
      notFoundTitle: 'Page not found',
      notFoundText: 'The page you are looking for doesn’t exist or has moved.',
      backHome: 'Back to home',
      formSuccess: 'Thanks! We’ll get back to you shortly.',
    },
    seo: {_type: 'seo', image: image(assets.sky)},
  })
  await client.createIfNotExists({
    _id: 'header-en',
    _type: 'header',
    language: LANGUAGE,
    navigation: [
      navItem('About', {internal: aboutId}),
      navItem('Pricing', pricing),
      navItem('Blog', {internal: blogId}),
      navItem('FAQ', {internal: faqId}),
      navItem('Contact', {internal: contactId}),
    ],
    loginButton: button('Login', {url: 'https://app.example.com/login'}),
  })
  await client.createIfNotExists({
    _id: 'footer-en',
    _type: 'footer',
    language: LANGUAGE,
    ctaHeading: 'Spend less time on admin.',
    ctaText: 'Join the associations that run memberships, payments and communication from one place.',
    ctaPrimary: button('Start your free trial', pricing),
    ctaSecondary: button('Talk to us', {internal: contactId}),
    tagline: 'The all-in-one platform for associations, clubs and their volunteers.',
    columns: [
      {_type: 'navGroup', _key: key(), title: 'Product', links: [navItem('Features', {internal: homeId, anchor: 'features'}), navItem('Pricing', pricing), navItem('FAQ', {internal: faqId})]},
      {_type: 'navGroup', _key: key(), title: 'Company', links: [navItem('About', {internal: aboutId}), navItem('Contact', {internal: contactId})]},
      {_type: 'navGroup', _key: key(), title: 'Resources', links: [navItem('Blog', {internal: blogId}), navItem('Guides', {internal: blogId})]},
    ],
    copyright: '© {year} Formwise. All rights reserved.',
  })

  console.log('Done.')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
