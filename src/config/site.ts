import type { SiteConfig } from './types';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locales';

const siteConfig: SiteConfig = {
  // Basic site information
  siteUrl: 'https://park-jihee.github.io',
  title: {
    ko: '2l6l',
  },
  description: {
    ko: 'Odoo ERP · 개발 · AI 이야기',
  },

  // Home page hero
  home: {
    headline: {
      ko: ['Odoo를 만들며 겪은 문제와', '해결 과정을 **기록**합니다.'],
    },
    intro: {
      ko: 'ERP 개발 현장의 삽질, 그리고 AI를 업무에 녹여낸 경험을 정리하는 기술 블로그.',
    },
  },

  // Author information
  author: {
    name: {
      ko: '박지희',
    },
    email: 'parkjihee@ecodoobiz.com',
    avatar: '/img/avatar.png',
    bio: {
      ko: 'Odoo ERP 개발자.\n개발과 AI 이야기를 씁니다.',
    },
  },

  // Blog settings
  postsPerPage: 10,
  featuredImageFallback: '/img/posts/placeholder.svg',

  // Profile info rows in the sidebar (url is optional)
  profileLinks: [
    { label: '회사', value: '에코두비즈' },
    { label: 'GitHub', value: 'park-jihee', url: 'https://github.com/park-jihee' },
    { label: 'Email', value: '메일 보내기', url: 'mailto:parkjihee@ecodoobiz.com' },
  ],

  projects: [],

  categories: {
    odoo: {
      enabled: true,
      path: '/odoo',
      icon: 'extension',
      label: {
        ko: 'Odoo',
      },
      description: {
        ko: 'Odoo 모듈 개발, ORM, 커스터마이징 팁',
      },
    },
    ai: {
      enabled: true,
      path: '/ai',
      icon: 'smart_toy',
      label: {
        ko: 'AI',
      },
      description: {
        ko: 'AI 활용, Odoo + AI 연동',
      },
    },
    dev: {
      enabled: true,
      path: '/dev',
      icon: 'code',
      label: {
        ko: '개발',
      },
      description: {
        ko: 'Python, PostgreSQL, Docker 등 일반 개발',
      },
    },
    projects: {
      enabled: true,
      path: '/projects',
      icon: 'build',
      label: {
        ko: '프로젝트',
      },
      description: {
        ko: '프로젝트 회고',
      },
    },
  },

  navigation: [
    {
      id: 'about',
      labelKey: 'ui.about',
      translationKey: 'about',
    },
  ],

  // Feature toggles
  features: {
    darkMode: false,
    search: true,
    rss: true,
    sitemap: true,
    imageLightbox: true,
    postNavigation: false,
    readingTime: false,
    viewCounter: false,
  },

  // SEO & Meta tags
  seo: {
    defaultImage: '/img/og-image.svg',
    twitterHandle: '',
    googleAnalytics: '',
  },

  // Language settings
  defaultLanguage: DEFAULT_LOCALE,
  languages: [...SUPPORTED_LOCALES],

  // Date format settings
  dateFormats: {
    ko: {
      locale: 'ko-KR',
      options: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
      compactOptions: {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      },
    },
  },
};

export default siteConfig;
