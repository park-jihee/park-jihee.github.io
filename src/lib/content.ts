import { getCollection, type CollectionEntry } from 'astro:content';
import siteConfig from '@config/site';
import { DEFAULT_LOCALE } from '@lib/language';
import { ensureTrailingSlash } from '@utils/url';

export type PostEntry = CollectionEntry<'posts'>;
export type PageEntry = CollectionEntry<'pages'>;

export interface GetPostsOptions {
  lang?: string;
  category?: string;
  includeDrafts?: boolean;
}

const DEFAULT_POST_SORT = (a: PostEntry, b: PostEntry) =>
  b.data.date.getTime() - a.data.date.getTime();

const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  odoo: '/img/posts/placeholder-technology.svg',
  ai: '/img/posts/placeholder-technology.svg',
  dev: '/img/posts/placeholder-blog.svg',
  projects: '/img/posts/placeholder-projects.svg',
};

const SLASH_TRIM_REGEX = /^\/+|\/+$/g;
const DOMAIN_PREFIX_REGEX = /^https?:\/\/[^/]+/i;

const trimSlashes = (value: string): string => value.replace(SLASH_TRIM_REGEX, '');

const stripDomain = (value: string): string => value.replace(DOMAIN_PREFIX_REGEX, '');

const normalizePath = (value: string | undefined | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withoutDomain = stripDomain(trimmed);
  const normalized = trimSlashes(withoutDomain);
  return normalized ? normalized : null;
};

const pickSegment = (value: string, fallback: string, context?: string): string => {
  if (!value.includes('/')) {
    return value;
  }

  const segments = value.split('/').filter(Boolean);
  const last = segments.pop();
  if (!last) {
    return fallback;
  }

  if (context) {
    console.warn(
      `[content] ${context} "${value}" contains "/" – using "${last}" segment instead.`,
    );
  }

  return last;
};

const getSlugFromPermalink = (
  candidate: string | undefined,
  fallback: string,
  context: string,
): string => {
  const normalized = normalizePath(candidate);
  if (!normalized) {
    return fallback;
  }

  return pickSegment(normalized, fallback, context);
};

const categoryPathSegmentCache = new Map<string, string>();

function derivePostMeta(entry: PostEntry) {
  const segments = entry.slug.split('/');
  const [lang = DEFAULT_LOCALE, category = 'odoo', ...rest] = segments;
  const fallbackKey = rest.length > 0 ? rest.join('/') : entry.id;
  const translationKey = fallbackKey;

  const fallbackSlug =
    rest.length > 0 ? rest[rest.length - 1] : entry.slug.split('/').pop() ?? entry.id;

  return { lang, category, translationKey, fallbackSlug };
}

function derivePageMeta(entry: PageEntry) {
  const segments = entry.slug.split('/');
  const [lang = DEFAULT_LOCALE, ...rest] = segments;
  const fallbackKey = rest.length > 0 ? rest.join('/') : entry.id;
  const translationKey = fallbackKey;

  const fallbackSlug =
    rest.length > 0 ? rest[rest.length - 1] : entry.slug.split('/').pop() ?? entry.id;
  const fallbackPath = rest.join('/');

  return { lang, translationKey, fallbackSlug, fallbackPath };
}

function buildDraftTranslationKeySet<T>(
  entries: T[],
  getKey: (entry: T) => string,
): Set<string> {
  const draftKeys = new Set<string>();

  for (const entry of entries as Array<T & { data: { draft?: boolean } }>) {
    if (entry?.data?.draft) {
      draftKeys.add(getKey(entry));
    }
  }

  return draftKeys;
}

function filterDraftedEntries<T>(
  entries: T[],
  getKey: (entry: T) => string,
  includeDrafts = false,
): T[] {
  if (includeDrafts) {
    return entries;
  }

  const draftKeys = buildDraftTranslationKeySet(entries, getKey);

  return (entries as Array<T & { data: { draft?: boolean } }>).filter((entry) => {
    if (entry.data?.draft) {
      return false;
    }

    return !draftKeys.has(getKey(entry));
  });
}

// Today's date (YYYY-MM-DD) in Korea time, so posts go live on their date in KST.
const todayInKorea = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());

// Posts dated in the future stay hidden until that date (the site is rebuilt daily).
const isScheduledPost = (entry: PostEntry) =>
  entry.data.date.toISOString().slice(0, 10) > todayInKorea();

const filterDraftedPostEntries = (entries: PostEntry[], includeDrafts = false) =>
  filterDraftedEntries(
    includeDrafts ? entries : entries.filter((entry) => !isScheduledPost(entry)),
    getPostTranslationKey,
    includeDrafts,
  );

const filterDraftedPageEntries = (entries: PageEntry[], includeDrafts = false) =>
  filterDraftedEntries(entries, getPageTranslationKey, includeDrafts);

export async function getPosts(options: GetPostsOptions = {}) {
  const { lang, category, includeDrafts = false } = options;

  const entries = await getCollection('posts');
  const publishedEntries = filterDraftedPostEntries(entries, includeDrafts);

  const filtered = publishedEntries.filter((entry) => {
    const meta = derivePostMeta(entry);
    const categoryConfig = siteConfig.categories[meta.category];

    if (!categoryConfig?.enabled) return false;
    if (lang && meta.lang !== lang) return false;
    if (category && meta.category !== category) return false;
    return true;
  });

  return filtered.sort(DEFAULT_POST_SORT);
}

export async function getPageByTranslationKey(
  translationKey: string,
  lang: string,
) {
  const entries = await getCollection('pages');
  const publishedEntries = filterDraftedPageEntries(entries);
  return (
    publishedEntries.find((entry) => {
      const meta = derivePageMeta(entry);
      return meta.translationKey === translationKey && meta.lang === lang;
    }) ?? null
  );
}

export function getPostPermalink(entry: PostEntry) {
  const { lang, category } = derivePostMeta(entry);
  const slug = getPostSlug(entry);
  const categorySegment = getCategoryPathSegment(category);
  const basePath = `/${categorySegment}/${slug}`;

  const isDefaultLang = lang === DEFAULT_LOCALE;
  const url = isDefaultLang ? basePath : `/${lang}${basePath}`;

  return ensureTrailingSlash(url);
}

export function getPostCategory(entry: PostEntry) {
  return derivePostMeta(entry).category;
}

export function getPostLanguage(entry: PostEntry) {
  return derivePostMeta(entry).lang;
}

export function getPostTranslationKey(entry: PostEntry) {
  return derivePostMeta(entry).translationKey;
}

export async function getPostTranslations(entry: PostEntry) {
  const translationKey = getPostTranslationKey(entry);
  const allTranslations = await getCollection('posts');
  const publishedEntries = filterDraftedPostEntries(allTranslations);
  return publishedEntries
    .filter((candidate) => {
      if (getPostTranslationKey(candidate) !== translationKey) return false;
      const categoryConfig = siteConfig.categories[getPostCategory(candidate)];
      return Boolean(categoryConfig?.enabled);
    })
    .sort(DEFAULT_POST_SORT);
}

// Plain-text version of a markdown body (for summaries, search, reading time).
export function cleanMarkdown(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/^#+\s+(.*)/gm, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Summary shown in post lists: start of the body text (headings and captions skipped),
// falling back to description → announcement for posts without body text.
export function getPostSummary(entry: PostEntry, maxLength = 300): string {
  const bodyText = cleanMarkdown(
    entry.body
      .replace(/^#+\s.*$/gm, '')
      .replace(/<figcaption>[\s\S]*?<\/figcaption>/g, '')
  );
  if (bodyText) {
    return bodyText.length > maxLength ? `${bodyText.slice(0, maxLength).trim()}…` : bodyText;
  }

  return entry.data.description ?? entry.data.announcement ?? '';
}

// Rough reading time in minutes (Korean ≈ 500 characters per minute).
export function getReadingMinutes(entry: PostEntry): number {
  const text = cleanMarkdown(entry.body).replace(/\s+/g, '');
  return Math.max(1, Math.round(text.length / 500));
}

// Image set by the post itself (frontmatter or first image in the body); no placeholder fallback.
export function getPostCoverImage(entry: PostEntry): string | null {
  if (entry.data.image) {
    return entry.data.image;
  }

  const imageMatch = /!\[[^\]]*]\(([^)]+)\)/.exec(entry.body);
  return imageMatch ? imageMatch[1] : null;
}

export function getPostImage(entry: PostEntry) {
  if (entry.data.image) {
    return entry.data.image;
  }

  const imageMatch = /!\[[^\]]*]\(([^)]+)\)/.exec(entry.body);
  if (imageMatch) {
    return imageMatch[1];
  }

  const category = getPostCategory(entry);

  return (
    CATEGORY_PLACEHOLDERS[category] ??
    siteConfig.featuredImageFallback
  );
}

export function getPageLanguage(entry: PageEntry) {
  return derivePageMeta(entry).lang;
}

export function getPageTranslationKey(entry: PageEntry) {
  return derivePageMeta(entry).translationKey;
}

export function getPageSlug(entry: PageEntry) {
  const { fallbackPath } = derivePageMeta(entry);
  const normalized = normalizePath(entry.data.permalink);
  return normalized ?? fallbackPath;
}

export function getPagePermalink(entry: PageEntry) {
  const slug = getPageSlug(entry);
  const lang = getPageLanguage(entry);
  const basePath = slug ? `/${slug}` : '/';

  return lang === DEFAULT_LOCALE
    ? ensureTrailingSlash(basePath)
    : ensureTrailingSlash(`/${lang}${basePath}`);
}

export async function getPageTranslations(entry: PageEntry) {
  const translationKey = getPageTranslationKey(entry);
  const allTranslations = await getCollection('pages');
  const publishedEntries = filterDraftedPageEntries(allTranslations);

  return publishedEntries.filter(
    (candidate) => getPageTranslationKey(candidate) === translationKey,
  );
}

export const getEnabledCategoryIds = (): string[] =>
  Object.entries(siteConfig.categories)
    .filter(([, config]) => config.enabled)
    .map(([id]) => id);

export const isCategoryEnabled = (categoryId: string): boolean =>
  Boolean(siteConfig.categories[categoryId]?.enabled);

export const getCategoryConfig = (categoryId: string) => siteConfig.categories[categoryId] ?? null;

export function getCategoryPathSegment(categoryId: string): string {
  if (categoryPathSegmentCache.has(categoryId)) {
    return categoryPathSegmentCache.get(categoryId)!;
  }

  const config = siteConfig.categories[categoryId];
  const fallback = categoryId;

  if (!config) {
    categoryPathSegmentCache.set(categoryId, fallback);
    return fallback;
  }

  const normalized = normalizePath(config.path);
  if (!normalized) {
    categoryPathSegmentCache.set(categoryId, fallback);
    return fallback;
  }

  const segment = pickSegment(normalized, fallback, `Category "${categoryId}" path`);
  categoryPathSegmentCache.set(categoryId, segment);
  return segment;
}

export function getCategoryPath(categoryId: string): string {
  return ensureTrailingSlash(`/${getCategoryPathSegment(categoryId)}`);
}

export function getCategoryPermalink(categoryId: string, lang: string = DEFAULT_LOCALE): string {
  const basePath = getCategoryPath(categoryId);
  return lang === DEFAULT_LOCALE
    ? basePath
    : ensureTrailingSlash(`/${lang}${basePath}`);
}

export function findCategoryIdByPathSegment(segment: string): string | null {
  const normalized = normalizePath(segment) ?? segment;
  const candidates = Object.keys(siteConfig.categories);
  for (const candidate of candidates) {
    if (getCategoryPathSegment(candidate) === normalized) {
      return candidate;
    }
  }

  return null;
}

export const getPostSlug = (entry: PostEntry): string => {
  const { fallbackSlug } = derivePostMeta(entry);
  return getSlugFromPermalink(entry.data.permalink, fallbackSlug, `Post "${entry.id}" permalink`);
};

export type PostsByLocale = {
  lang: string;
  posts: PostEntry[];
};

export type TopLevelPageDescriptor = {
  entry: PageEntry;
  lang: string;
  slug: string;
  translationKey: string;
};

export async function groupPostsByLocales(
  locales: readonly string[],
  options: { category?: string; includeDrafts?: boolean } = {},
): Promise<PostsByLocale[]> {
  const { category, includeDrafts } = options;

  const groups = await Promise.all(
    locales.map(async (locale) => {
      const postsForLocale = await getPosts({ lang: locale, category, includeDrafts });
      return { lang: locale, posts: postsForLocale };
    }),
  );

  return groups.filter((group) => group.posts.length > 0);
}

export async function findTopLevelPage(options: {
  translationKey: string;
  lang: string;
  slug: string;
}): Promise<PageEntry | null> {
  const { translationKey, lang, slug } = options;
  const entry = await getPageByTranslationKey(translationKey, lang);
  if (!entry) {
    return null;
  }

  const entrySlug = getPageSlug(entry);
  if (!entrySlug || entrySlug.includes('/')) {
    return null;
  }

  return entrySlug === slug ? entry : null;
}

export async function getTopLevelPageDescriptors(): Promise<TopLevelPageDescriptor[]> {
  const pages = await getCollection('pages');
  const publishedPages = filterDraftedPageEntries(pages);

  return publishedPages
    .map((entry) => {
      const slug = getPageSlug(entry);
      if (!slug || slug.includes('/')) {
        return null;
      }

      return {
        entry,
        lang: getPageLanguage(entry),
        slug,
        translationKey: getPageTranslationKey(entry),
      };
    })
    .filter((value): value is TopLevelPageDescriptor => value !== null);
}
