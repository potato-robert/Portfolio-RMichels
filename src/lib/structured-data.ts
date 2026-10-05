import type { Locale } from './i18n';

const PERSON_ID = 'https://rmichels.com/#person';
const WEBSITE_ID = 'https://rmichels.com/#website';

export interface CreativeWorkInput {
  name: string;
  description: string;
  image: string;
  url: string;
  inLanguage: string;
}

function personNode() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Robert Michels',
    url: 'https://rmichels.com/about',
    jobTitle: 'Designer and Developer',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Vancouver',
      addressCountry: 'CA',
    },
  };
}

function websiteNode(siteUrl: string) {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: siteUrl,
    name: 'Robert Michels Portfolio',
    author: { '@id': PERSON_ID },
    inLanguage: ['en', 'de'],
  };
}

function profilePageNode(pageUrl: string) {
  return {
    '@type': 'ProfilePage',
    '@id': `${pageUrl}#profile`,
    url: pageUrl,
    mainEntity: { '@id': PERSON_ID },
  };
}

function creativeWorkNode(work: CreativeWorkInput) {
  return {
    '@type': 'CreativeWork',
    name: work.name,
    description: work.description,
    image: work.image,
    url: work.url,
    inLanguage: work.inLanguage,
    author: { '@id': PERSON_ID },
  };
}

export type StructuredDataPageType =
  | 'home'
  | 'about'
  | 'projects'
  | 'project'
  | 'privacy'
  | 'default';

export function buildJsonLdGraph(options: {
  pageType: StructuredDataPageType;
  siteUrl: string;
  pageUrl: string;
  locale: Locale;
  creativeWork?: CreativeWorkInput;
}): Record<string, unknown> {
  const { pageType, siteUrl, pageUrl, creativeWork } = options;
  const graph: Record<string, unknown>[] = [personNode()];

  if (pageType === 'home') {
    graph.push(websiteNode(siteUrl));
  } else if (pageType === 'about') {
    graph.push(profilePageNode(pageUrl));
  } else if (pageType === 'project' && creativeWork) {
    graph.push(creativeWorkNode(creativeWork));
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
