import siteConfig from '@config/site';
import {
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type LocaleCode,
} from '@config/locales';

type UiDictionary = Record<string, string>;

const fallbackTexts: UiDictionary = {
  'ui.categories': 'Categories',
  'ui.profile': 'Profile',
  'ui.projects': 'Projects',
  'ui.projects_title': 'Projects',
  'ui.projects_description': 'Featured projects and experiments',
  'ui.contacts': 'Contact',
  'ui.about': 'About',
  'ui.technology': 'Technology',
  'ui.technology_posts': 'Technology Posts',
  'ui.technology_description': 'Latest posts about technology, programming, and development',
  'ui.blog': 'Blog',
  'ui.blog_posts': 'Blog Posts',
  'ui.blog_description': 'Personal thoughts, experiences, and insights',
  'ui.not_found': 'Post not found',
  'ui.no_posts': 'No posts yet',
  'ui.search': 'Search',
  'ui.search_placeholder': 'Search...',
  'ui.prev': 'Prev',
  'ui.next': 'Next',
  'ui.back': 'Back',
  'ui.top': 'Top',
  'ui.search_results_heading': 'Search results',
  'ui.search_no_results': 'No results found',
  'ui.page_not_found': 'Page not found',
  'ui.404_message': 'The page you are looking for does not exist.',
  'ui.ai_warning': 'The content of this material is written or translated using AI',
  'ui.contents': 'Contents',
  'ui.all_posts': 'All Posts',
  'ui.recent_posts': 'Recent Posts',
};

const getLocalizedValue = <T>(
  record: Record<LocaleCode, T>,
  code: LocaleCode,
): T => {
  return record[code] ?? record[DEFAULT_LOCALE];
};

const getCategoryLabel = (
  categoryId: string,
  code: LocaleCode,
  fallback: string,
): string => {
  const category = siteConfig.categories[categoryId];
  if (!category) {
    return fallback;
  }

  return (
    category.label?.[code] ??
    category.label?.[DEFAULT_LOCALE] ??
    fallback
  );
};

const getCategoryDescription = (
  categoryId: string,
  code: LocaleCode,
  fallback: string,
): string => {
  const category = siteConfig.categories[categoryId];
  if (!category) {
    return fallback;
  }

  return (
    category.description?.[code] ??
    category.description?.[DEFAULT_LOCALE] ??
    fallback
  );
};

const localeOverrides: Partial<Record<LocaleCode, Partial<UiDictionary>>> = {
  ko: {
    'ui.categories': '카테고리',
    'ui.profile': '프로필',
    'ui.contacts': '연락처',
    'ui.about': '소개',
    'ui.not_found': '글을 찾을 수 없습니다',
    'ui.no_posts': '아직 글이 없습니다',
    'ui.search': '검색',
    'ui.search_placeholder': '검색...',
    'ui.prev': '이전',
    'ui.next': '다음',
    'ui.back': '뒤로',
    'ui.top': '맨 위로',
    'ui.page_not_found': '페이지를 찾을 수 없습니다',
    'ui.search_results_heading': '검색 결과',
    'ui.search_no_results': '검색 결과가 없습니다',
    'ui.404_message': '요청하신 페이지가 존재하지 않습니다.',
    'ui.ai_warning': '이 글은 AI의 도움을 받아 작성되었습니다',
    'ui.contents': '목차',
    'ui.all_posts': '전체 글',
    'ui.recent_posts': '최근 글',
  },
};

const buildDictionary = (code: LocaleCode): UiDictionary => {
  const base: UiDictionary = { ...fallbackTexts };

  base.name = getLocalizedValue(siteConfig.author.name, code);
  base['ui.description'] = getLocalizedValue(siteConfig.description, code);

  base['ui.projects'] = getCategoryLabel('projects', code, base['ui.projects']);
  base['ui.projects_title'] = getCategoryLabel(
    'projects',
    code,
    base['ui.projects_title'],
  );
  base['ui.projects_description'] = getCategoryDescription(
    'projects',
    code,
    base['ui.projects_description'],
  );

  base['ui.technology'] = getCategoryLabel(
    'technology',
    code,
    base['ui.technology'],
  );
  base['ui.technology_description'] = getCategoryDescription(
    'technology',
    code,
    base['ui.technology_description'],
  );

  base['ui.blog'] = getCategoryLabel('blog', code, base['ui.blog']);
  base['ui.blog_description'] = getCategoryDescription(
    'blog',
    code,
    base['ui.blog_description'],
  );

  const overrides = localeOverrides[code] ?? {};
  return {
    ...base,
    ...overrides,
  };
};

export const languages: Record<LocaleCode, string> = { ...LOCALE_LABELS };

export const defaultLang = siteConfig.defaultLanguage ?? DEFAULT_LOCALE;

export const ui = SUPPORTED_LOCALES.reduce<Record<LocaleCode, UiDictionary>>(
  (acc, code) => {
    acc[code] = buildDictionary(code);
    return acc;
  },
  {} as Record<LocaleCode, UiDictionary>,
);

export const showDefaultLang = false;
