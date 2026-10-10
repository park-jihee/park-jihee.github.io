import type { SiteConfig } from './types';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locales';

const siteConfig: SiteConfig = {
  // Basic site information
  siteUrl: 'https://park-jihee.github.io',
  title: {
    ko: '박지희 기술 블로그',
  },
  description: {
    ko: 'Odoo ERP · 개발 · AI 이야기',
  },

  // Author information
  author: {
    name: {
      ko: '박지희',
    },
    email: 'parkjihee@ecodoobiz.com',
    avatar: '/img/avatar.svg',
    bio: {
      ko: '에코두비즈 개발팀 · Odoo ERP 개발',
    },
  },

  // Blog settings
  postsPerPage: 10,
  featuredImageFallback: '/img/posts/placeholder.svg',

  // Contact & social links
  contactLinks: [
    {
      id: 'github',
      label: {
        ko: 'GitHub',
      },
      url: 'https://github.com/park-jihee',
      iconSvg: `<svg
  stroke="currentColor"
  fill="currentColor"
  stroke-width="0"
  viewBox="0 0 1024 1024"
  class="icon"
  height="1em"
  width="1em"
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0 1 38.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path>
</svg>`,
    },
    {
      id: 'email',
      label: {
        ko: 'Email',
      },
      url: 'mailto:parkjihee@ecodoobiz.com',
      icon: 'mail',
    },
    // TODO: LinkedIn, velog, 회사 사이트 주소가 정해지면 추가
    // {
    //   id: 'velog',
    //   label: { ko: 'velog' },
    //   url: 'https://velog.io/@아이디',
    //   icon: 'edit_note',
    // },
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
    darkMode: true,
    search: true,
    rss: true,
    sitemap: true,
    imageLightbox: true,
    postNavigation: true,
    readingTime: true,
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
