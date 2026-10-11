import type { LocaleCode } from './locales';

export type LocaleRecord<T> = Record<LocaleCode, T>;

export interface SiteAuthorConfig {
  name: LocaleRecord<string>;
  email: string;
  avatar: string;
  bio: LocaleRecord<string>;
}

export interface SiteCategoryConfig {
  enabled: boolean;
  path: string;
  icon: string;
  label: LocaleRecord<string>;
  description: LocaleRecord<string>;
}

export interface SiteNavigationItemConfig {
  id: string;
  labelKey?: string;
  label?: LocaleRecord<string>;
  translationKey?: string;
  path?: string;
  external?: string;
}

export interface SiteFeatureToggles {
  darkMode: boolean;
  search: boolean;
  rss: boolean;
  sitemap: boolean;
  imageLightbox: boolean;
  postNavigation: boolean;
  readingTime: boolean;
  viewCounter: boolean;
}

export interface SiteSeoConfig {
  defaultImage: string;
  twitterHandle: string;
  googleAnalytics: string;
}

export interface SiteProjectLink {
  id: string;
  url: string;
  label: LocaleRecord<string>;
  icon?: string;
  iconSvg?: string;
}

export interface SiteProfileLink {
  label: string;
  value: string;
  url?: string;
}

export interface SiteHomeConfig {
  eyebrow: LocaleRecord<string>;
  // Wrap a word in **double asterisks** to highlight it.
  headline: LocaleRecord<string[]>;
  intro: LocaleRecord<string>;
}

export interface SiteConfig {
  siteUrl: string;
  title: LocaleRecord<string>;
  description: LocaleRecord<string>;
  home: SiteHomeConfig;
  author: SiteAuthorConfig;
  postsPerPage: number;
  featuredImageFallback: string;
  profileLinks: SiteProfileLink[];
  projects: SiteProjectLink[];
  categories: Record<string, SiteCategoryConfig>;
  navigation: SiteNavigationItemConfig[];
  features: SiteFeatureToggles;
  seo: SiteSeoConfig;
  defaultLanguage: LocaleCode;
  languages: LocaleCode[];
  dateFormats: LocaleRecord<{
    locale: string;
    options: Intl.DateTimeFormatOptions;
    compactOptions?: Intl.DateTimeFormatOptions;
  }>;
}

export type { LocaleCode } from './locales';
