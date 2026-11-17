export interface ImageAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Term {
  slug: string;
  name: string;
  count?: number;
  size?: number;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  /** A sentence or two shown under the title, for projects whose content is only pictures. */
  summary?: string;
  date: string;
  content: string;
  image: ImageAsset | null;
  categories: Term[];
  tags: Term[];
}

export interface PageRecord {
  slug: string;
  title: string;
  date: string;
  content: string;
  image: ImageAsset | null;
}

export interface SiteData {
  logo: string;
  pages: Record<string, PageRecord>;
  extraPages: PageRecord[];
  projects: Project[];
  categories: Term[];
  tags: Term[];
}

import siteData from '../data/site.json';

/**
 * Curly quotes, apostrophes and en dashes in text (never inside tags), as WordPress rendered them.
 * The previous visible character is tracked across tags so `"<strong>x</strong>"` closes correctly.
 */
export function typography(html: string): string {
  let previous = ' ';
  return html
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith('<')) {
        if (/^<(br|\/?p|\/?li|\/?h\d|\/?figcaption)\b/i.test(part)) previous = ' ';
        return part;
      }
      let out = '';
      for (const char of part) {
        if (char === '"') out += /[\s(\[{–—-]/.test(previous) ? '“' : '”';
        else if (char === "'") out += /[\s(\[{]/.test(previous) ? '‘' : '’';
        else out += char;
        previous = char;
      }
      return out.replace(/ - /g, ' – ');
    })
    .join('');
}

// Project cards baked into the imported pages get the same markup as CardGrid (title link inside an h3).
const BAKED_CARD = /<li class="card"><a href="([^"]+)">(<img [^>]*\/>)?<span>([\s\S]*?)<\/span><\/a><\/li>/g;

const raw = siteData as SiteData;

// WordPress's tag cloud scale: 8pt–22pt on round(log10(count + 1) * 100).
const scaled = raw.tags.map((tag) => Math.round(Math.log10((tag.count ?? 0) + 1) * 100));
const minScaled = Math.min(...scaled);
const spread = Math.max(...scaled) - minScaled || 1;
export const tagCloud = raw.tags.map((tag, index) => ({
  ...tag,
  size: +(8 + ((scaled[index] - minScaled) * 14) / spread).toFixed(2),
}));
const tagSize = new Map(tagCloud.map((tag) => [tag.slug, tag.size]));
const BAKED_TAG = /<a href="\/tag\/([^"]+)" style="font-size: [\d.]+pt"/g;

for (const record of [...Object.values(raw.pages), ...raw.extraPages, ...raw.projects]) {
  record.title = typography(record.title);
  record.content = typography(record.content).replace(
    BAKED_CARD,
    (_, href, img = '', title) => `<li class="card">${img}<h3 class="card-title"><a href="${href}">${title}</a></h3></li>`,
  ).replace(BAKED_TAG, (full, slug) => (tagSize.has(slug) ? `<a href="/tag/${slug}" style="font-size: ${tagSize.get(slug)}pt"` : full));
}
// Newest first, so a project added anywhere in site.json still lands in the right place.
raw.projects.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
export const site = raw;

export const SITE_NAME = 'Marichoo Illustrations';

/** The public path of a page: with build.format 'file' Astro reports /about.html for /about. */
export function cleanPath(pathname: string): string {
  return pathname.replace(/(\/index)?\.html$/, '').replace(/\/$/, '') || '/';
}
export const SITE_URL = 'https://marichoo.com';

export const person = {
  name: 'Marija Knezić Banožić',
  alternateName: 'Marichoo',
  jobTitle: 'Illustrator & Graphic Designer',
  email: 'info@marichoo.com',
  country: 'HR',
};

/** Clickable email link, with the subject already filled in. */
export const emailLink = `mailto:${person.email}?subject=Hello%20Marichoo`;

export const nav = [
  { href: '/', label: 'Home' },
  {
    href: '/portfolio',
    label: 'Portfolio',
    children: [
      { href: '/portfolio/illustration', label: 'Illustration' },
      { href: '/portfolio/graphic-design', label: 'Graphic Design' },
      { href: '/portfolio/art-installation', label: 'Art Installation' },
    ],
  },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export const social = [
  { href: 'https://www.instagram.com/___marichoo___/', label: 'Instagram' },
  { href: 'https://www.facebook.com/themarichoo/', label: 'Facebook' },
  { href: 'https://x.com/themarichoo', label: 'X' },
  { href: 'https://www.linkedin.com/in/marijaknezicmarichoo/', label: 'LinkedIn' },
  { href: 'https://www.pinterest.com/hellomarichoo/', label: 'Pinterest' },
  { href: 'https://dribbble.com/marichoo', label: 'Dribbble' },
  { href: 'https://www.behance.net/marichoo/', label: 'Behance' },
];

/** Search-result titles and descriptions for the main pages; the visible headings stay as they were. */
export const pageSeo: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Marichoo Illustrations | Marija Knezić Banožić, Illustrator & Graphic Designer',
    description:
      'Portfolio of Marichoo (Marija Knezić Banožić), illustrator, graphic designer and artist from Croatia: editorial, fashion and book illustration, branding and print.',
  },
  portfolio: {
    title: 'Portfolio | Illustration, Graphic Design & Art | Marichoo Illustrations',
    description:
      'Browse Marichoo’s portfolio: editorial and fashion illustration, graphic design for brands like Beck’s, Dukat and Vegeta, and art installations.',
  },
  about: {
    title: 'About | Marija Knezić Banožić, Illustrator | Marichoo Illustrations',
    description:
      'Marija Knezić Banožić aka Marichoo is a Croatian illustrator and graphic designer with 15+ years of agency and freelance experience. Read her story and CV.',
  },
  services: {
    title: 'Illustration & Graphic Design Services | Marichoo Illustrations',
    description:
      'Editorial, book and fashion illustration, logos, branding, ads, brochures and art direction. See how Marichoo can make your project outstanding.',
  },
  contact: {
    title: 'Contact | Hire an Illustrator & Designer | Marichoo Illustrations',
    description:
      'Get in touch with Marichoo for illustration, graphic design and creative projects. Email info@marichoo.com or message her on social media.',
  },
};

export const categorySeo: Record<string, string> = {
  illustration:
    'Editorial, fashion, food and portrait illustrations by Marichoo for magazines and brands such as Brigitte, Gesund.de, L-Mag, Playboy and ChefsFeed.',
  'graphic-design':
    'Graphic design by Marichoo: campaigns, newsletters, cookbooks, packaging, logos and print work for Gegenüber, Henschel, Dukat, Vegeta, Beck’s and more.',
  'art-installation':
    'Art installations and exhibitions by Marichoo, including the 36 Mountains illustration festival, Slap Stick and Shuffle.',
};

export type PageKey = 'home' | 'portfolio' | 'about' | 'services' | 'contact';

/** The schema.org node for one of the main pages; the site-wide WebSite and Person nodes come from Base. */
export function pageSchema(pageKey: PageKey) {
  const url = pageKey === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${pageKey}`;
  const type = { home: 'WebPage', portfolio: 'CollectionPage', about: 'AboutPage', services: 'WebPage', contact: 'ContactPage' }[pageKey];
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: pageSeo[pageKey].title,
    description: pageSeo[pageKey].description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#person` },
    ...(pageKey === 'about' || pageKey === 'home' ? { mainEntity: { '@id': `${SITE_URL}/#person` } } : {}),
  };
}

/** Drops the old "Let's work together" box at the end of imported pages; the footer now carries that invitation. */
export function withoutOutro(html: string): string {
  return html.replace(/<h2[^>]*>\s*Let[’']s work together!?\s*<\/h2>[\s\S]*$/, '').trim();
}

export const categories = [
  { href: '/portfolio/illustration', slug: 'illustration', label: 'Illustration' },
  { href: '/portfolio/graphic-design', slug: 'graphic-design', label: 'Graphic design' },
  { href: '/portfolio/art-installation', slug: 'art-installation', label: 'Art installation' },
];

/** Client logos, shown on the About and Services pages. Files live in src/assets/media. */
export const clientLogos = [
  { src: '/media/chefsfeed-logo.png', name: 'ChefsFeed' },
  { src: '/media/playboy-logo-e1604261079276.png', name: 'Playboy' },
  { src: '/media/becks-logo.png', name: 'Beck’s' },
  { src: '/media/podravka-logo.png', name: 'Podravka' },
  { src: '/media/lactalis-group-logo.png', name: 'Lactalis Group' },
  { src: '/media/BBDO-logo-e1604261028793.png', name: 'BBDO' },
  { src: '/media/staropramen-logo.png', name: 'Staropramen' },
  { src: '/media/henschel-logo.png', name: 'Henschel' },
  { src: '/media/gegenueber-logo.png', name: 'Gegenüber' },
  { src: '/media/vizkultura-logo.png', name: 'Vizkultura' },
  { src: '/media/l-mag-logo.png', name: 'L-Mag' },
  { src: '/media/dukat-logo.png', name: 'Dukat' },
  { src: '/media/ozujsko-logo.png', name: 'Ožujsko' },
  { src: '/media/partus-akademija-logo.png', name: 'Partus Akademija' },
  { src: '/media/wrigley-logo.png', name: 'Wrigley' },
  { src: '/media/uzagorju-logo.png', name: 'u Zagorju' },
  { src: '/media/plazma-logo.png', name: 'Plazma' },
  { src: '/media/Vienna-Insurance-Group-logo.png', name: 'Vienna Insurance Group' },
];

const BLOCK_TAG =/<\/?(p|br|li|ul|ol|h\d|div|figure|figcaption|blockquote|tr|td)\b[^>]*>/gi;

export function plainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(BLOCK_TAG, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;|&#038;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

export function descriptionFor(title: string, html: string, fallback?: string): string {
  const text = plainText(html);
  const source = text.length >= 70 ? text : fallback || text || `${title}. Illustration, graphic design and art by Marichoo.`;
  if (source.length <= 158) return source;
  return `${source.slice(0, 155).replace(/\s+\S*$/, '')}…`;
}

export function projectDescription(project: Project): string {
  const kind = project.categories[0]?.name.toLowerCase() || 'work';
  const topics = project.tags
    .map((tag) => tag.name)
    .filter((name) => name.toLowerCase() !== kind)
    .slice(0, 3)
    .join(', ');
  const fallback = `${project.title} – ${kind} by Marichoo (Marija Knezić Banožić), illustrator and graphic designer.${topics ? ` ${topics}.` : ''}`;
  const text = project.summary ? `<p>${project.summary}</p>${project.content}` : project.content;
  return descriptionFor(project.title, text, fallback);
}

export function projectsInCategory(slug: string): Project[] {
  return site.projects.filter((project) => project.categories.some((category) => category.slug === slug));
}

export function projectsWithTag(slug: string): Project[] {
  return site.projects.filter((project) => project.tags.some((tag) => tag.slug === slug));
}

export function neighbors(slug: string): { previous: Project | null; next: Project | null } {
  const ordered = [...site.projects].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id));
  const index = ordered.findIndex((project) => project.slug === slug);
  return {
    previous: index > 0 ? ordered[index - 1] : null,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null,
  };
}
