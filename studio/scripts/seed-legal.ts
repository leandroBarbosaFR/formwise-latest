/**
 * Creates the legal pages (privacy, terms, cookies, legal notice) and a footer "Legal" column
 * as DRAFTS. Fill in the [bracketed] details in the Studio, then publish: publishing the English
 * pages triggers the automatic translation.
 *
 *   npx sanity exec scripts/seed-legal.ts --with-user-token
 */
import {randomUUID} from 'node:crypto'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-10-05'})

const key = () => randomUUID().replace(/-/g, '').slice(0, 12)
const span = (text: string) => ({_type: 'span', _key: key(), text, marks: []})
const p = (text: string) => ({_type: 'block', _key: key(), style: 'normal', markDefs: [], children: [span(text)]})
const h2 = (text: string) => ({...p(text), style: 'h2'})
const h3 = (text: string) => ({...p(text), style: 'h3'})
const list = (items: string[]) => items.map((text) => ({...p(text), listItem: 'bullet', level: 1}))

const UPDATED = 'Last updated: [date]'

const pages = [
  {
    slug: 'privacy-policy',
    title: 'Privacy policy',
    eyebrow: 'Legal',
    heading: 'Privacy policy',
    text: 'How Formwise collects, uses and protects personal data.',
    description: 'How Formwise collects, uses and protects personal data, and the rights you have under the GDPR.',
    body: [
      p(UPDATED),
      h2('Who we are'),
      p('Formwise is operated by [Company legal name], [legal form], registered at [registered address] under number [company registration number] ("Formwise", "we", "us"). For any question about this policy or your personal data, contact us at [privacy email].'),
      h2('Our two roles'),
      p('When you visit our website or create a Formwise account, we decide how your personal data is used: we are the data controller.'),
      p('When an association uses Formwise to manage its members, the association decides what member data is stored and why. The association is the data controller and Formwise processes that data on its behalf as a data processor, under a data processing agreement. Members who want to exercise their rights over that data should contact their association first.'),
      h2('The data we collect'),
      ...list([
        'Account data: name, email address, association name, role and password (stored encrypted).',
        'Billing data: billing address, VAT number and payment history. Card details are handled by our payment provider and never stored by us.',
        'Usage data: pages visited, features used, device and browser type, and IP address, used to keep the service secure and working.',
        'Communications: messages you send us through the contact form, email or support.',
      ]),
      h2('Why we use it and on what legal basis'),
      ...list([
        'To provide the service and manage your account (performance of a contract).',
        'To bill you and meet our accounting obligations (legal obligation).',
        'To secure the service, prevent fraud and improve Formwise (legitimate interests).',
        'To send product news, only if you agreed to receive it (consent, which you can withdraw at any time).',
      ]),
      h2('Who we share it with'),
      p('We never sell personal data. We share it only with service providers who help us run Formwise, such as hosting, email delivery and payment processing, and only to the extent they need. Each of them is bound by a data processing agreement. The current list of sub-processors is available on request at [privacy email].'),
      h2('Where your data is stored'),
      p('Formwise data is hosted in the European Union. If a provider processes data outside the European Economic Area, we make sure the transfer is protected by an adequacy decision or the European Commission’s standard contractual clauses.'),
      h2('How long we keep it'),
      p('We keep account data for as long as your account is active and for [retention period] afterwards, unless the law requires us to keep it longer (for example, invoices are kept for [accounting retention period]). Associations can delete member data at any time, and all customer data is deleted within [deletion period] after an account is closed.'),
      h2('Your rights'),
      p('Under the General Data Protection Regulation (GDPR), you have the right to:'),
      ...list([
        'access the personal data we hold about you;',
        'have inaccurate data corrected;',
        'have your data erased;',
        'restrict or object to certain processing;',
        'receive your data in a portable format;',
        'withdraw your consent at any time, where we rely on consent.',
      ]),
      p('To exercise these rights, contact [privacy email]. We answer within one month. You also have the right to lodge a complaint with your national data protection authority.'),
      h2('Security'),
      p('We protect personal data with encryption in transit and at rest, access controls, regular backups and monitoring. Access to customer data within Formwise is limited to staff who need it to provide support.'),
      h2('Cookies'),
      p('Our use of cookies is explained in our cookie policy.'),
      h2('Changes to this policy'),
      p('We may update this policy from time to time. When we make significant changes, we will let account holders know by email before they take effect.'),
    ],
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of service',
    eyebrow: 'Legal',
    heading: 'Terms of service',
    text: 'The terms that apply when your association uses Formwise.',
    description: 'The terms and conditions that apply when your association uses Formwise.',
    body: [
      p(UPDATED),
      h2('1. About these terms'),
      p('These terms form an agreement between [Company legal name] ("Formwise") and the association or organisation that creates an account ("you"). By creating an account or using Formwise, you accept these terms on behalf of your organisation.'),
      h2('2. Your account'),
      p('You are responsible for the accuracy of your account information, for keeping your login details confidential, and for the actions of the people you invite to your account.'),
      h2('3. Free trial and plans'),
      p('New accounts start with a 15-day free trial with all features included. At the end of the trial, you can choose a paid plan or your account switches to the Free plan. Plan features and limits are described on our pricing page.'),
      h2('4. Prices and payment'),
      p('Paid plans are billed annually in advance. Prices are shown excluding VAT, which is added where applicable. Subscriptions renew automatically for another year unless you cancel before the renewal date. If you upgrade, the price difference is charged pro rata for the rest of your billing year.'),
      h2('5. Acceptable use'),
      p('You agree not to use Formwise to:'),
      ...list([
        'break any law or infringe the rights of others;',
        'send unsolicited messages or spam;',
        'upload malicious code or try to access other customers’ data;',
        'resell the service without our written permission.',
      ]),
      h2('6. Your data'),
      p('You keep full ownership of the data you store in Formwise. We process it only to provide the service and as described in our data processing agreement and privacy policy. You can export your data at any time.'),
      h2('7. Availability and support'),
      p('We work hard to keep Formwise available at all times, but we cannot guarantee uninterrupted service. Planned maintenance is announced in advance whenever possible. Support response times depend on your plan.'),
      h2('8. Intellectual property'),
      p('Formwise, including its software, design and brand, belongs to [Company legal name]. These terms give you a right to use the service during your subscription; they do not transfer any ownership.'),
      h2('9. Ending the agreement'),
      p('You can close your account at any time from your settings. We may suspend or close an account that seriously breaches these terms, after notifying you where possible. After closure, you have [export period] to export your data before it is deleted.'),
      h2('10. Liability'),
      p('Formwise is provided with reasonable care and skill. To the extent permitted by law, our total liability for any claim is limited to the amount you paid us in the twelve months before the claim. Nothing in these terms limits liability that cannot be limited by law.'),
      h2('11. Changes to these terms'),
      p('We may update these terms. We will notify you of significant changes at least 30 days before they take effect. If you do not agree, you can close your account before that date.'),
      h2('12. Governing law'),
      p('These terms are governed by the laws of [country]. Any dispute will be brought before the competent courts of [city], unless mandatory consumer protection rules provide otherwise.'),
      h2('Contact'),
      p('Questions about these terms: [legal email].'),
    ],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie policy',
    eyebrow: 'Legal',
    heading: 'Cookie policy',
    text: 'Which cookies we use and how you can control them.',
    description: 'Which cookies the Formwise website uses and how you can control them.',
    body: [
      p(UPDATED),
      h2('What cookies are'),
      p('Cookies are small text files that a website stores in your browser. Similar technologies, such as local storage, work in the same way. We refer to all of them as cookies in this policy.'),
      h2('Cookies on this website'),
      p('This website only uses cookies that are strictly necessary for it to work. It does not use advertising cookies, and it does not track you across other websites.'),
      h3('Strictly necessary'),
      p('These cookies keep the website secure and remember choices you make, such as your language. They do not require your consent and cannot be switched off.'),
      h3('Analytics and marketing'),
      p('We do not currently use analytics or marketing cookies. If we add them in the future, we will ask for your consent before setting them, and you will be able to change your choice at any time.'),
      h2('The Formwise application'),
      p('When you log in to Formwise, we use a session cookie to keep you signed in and secure. This cookie is strictly necessary and is deleted when you log out or when the session expires.'),
      h2('Managing cookies'),
      p('You can delete or block cookies in your browser settings. Blocking strictly necessary cookies may prevent parts of the website or the application from working.'),
      h2('Contact'),
      p('Questions about cookies: [privacy email].'),
    ],
  },
  {
    slug: 'legal-notice',
    title: 'Legal notice',
    eyebrow: 'Legal',
    heading: 'Legal notice',
    text: 'Information about the company that publishes this website.',
    description: 'Information about the publisher and host of the Formwise website.',
    body: [
      h2('Publisher'),
      ...list([
        'Company: [Company legal name]',
        'Legal form: [legal form] with a share capital of [share capital]',
        'Registered office: [registered address]',
        'Registration: [trade register and number]',
        'VAT number: [VAT number]',
        'Director of publication: [name of the legal representative]',
        'Email: [contact email]',
        'Phone: [phone number]',
      ]),
      h2('Hosting'),
      ...list(['Host: [hosting provider]', 'Address: [hosting provider address]', 'Website: [hosting provider website]']),
      p('Content is managed with Sanity (Sanity AS, Oslo, Norway).'),
      h2('Intellectual property'),
      p('All content on this website, including text, images, logos and design, is protected by intellectual property law and belongs to [Company legal name] or its licensors. Any reproduction without prior written permission is prohibited.'),
      h2('Personal data'),
      p('Information about how we process personal data is available in our privacy policy.'),
    ],
  },
]

async function run() {
  const created: Record<string, string> = {}

  for (const page of pages) {
    const existing = await client.fetch<string | null>(
      `*[_type == "page" && language == "en" && slug.current == $slug][0]._id`,
      {slug: page.slug},
    )
    if (existing) {
      console.log(`  = ${page.slug} already exists (${existing})`)
      created[page.slug] = existing.replace(/^drafts\./, '')
      continue
    }
    const id = randomUUID()
    await client.create({
      _id: `drafts.${id}`,
      _type: 'page',
      language: 'en',
      title: page.title,
      slug: {_type: 'slug', current: page.slug},
      seo: {_type: 'seo', description: page.description},
      sections: [
        {_type: 'pageHeaderSection', _key: key(), eyebrow: page.eyebrow, heading: page.heading, text: page.text},
        {_type: 'richTextSection', _key: key(), body: page.body},
      ],
    })
    created[page.slug] = id
    console.log(`  + draft page ${page.slug} (${id})`)
  }

  // Footer column linking to the legal pages, as a draft of the English footer
  const footer = await client.fetch(`coalesce(*[_id == "drafts.footer-en"][0], *[_id == "footer-en"][0])`)
  if (!footer) throw new Error('footer-en not found')
  if (footer.columns?.some((column: {title?: string}) => column.title === 'Legal')) {
    console.log('  = footer already has a Legal column')
    return
  }
  // Weak until the pages are published; the Studio makes them strong references on publish
  const pageLink = (label: string, slug: string) => ({
    _type: 'navItem',
    _key: key(),
    label,
    link: {
      _type: 'link',
      linkType: 'internal',
      internal: {_type: 'reference', _ref: created[slug], _weak: true, _strengthenOnPublish: {type: 'page'}},
    },
  })
  const {_rev, _updatedAt, _createdAt, ...rest} = footer
  await client.createOrReplace({
    ...rest,
    _id: 'drafts.footer-en',
    columns: [
      ...(footer.columns ?? []),
      {
        _type: 'navGroup',
        _key: key(),
        title: 'Legal',
        links: [
          pageLink('Privacy policy', 'privacy-policy'),
          pageLink('Terms of service', 'terms-of-service'),
          pageLink('Cookie policy', 'cookie-policy'),
          pageLink('Legal notice', 'legal-notice'),
        ],
      },
    ],
  })
  console.log('  + draft footer with a Legal column')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
