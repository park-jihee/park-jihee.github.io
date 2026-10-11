import {
  getLanguageFromPath,
  getLocaleConfig,
  normalizeLanguage,
  stripLanguageFromPath,
} from './locale';

type SearchPost = {
  title: string;
  content: string;
  url: string;
  lang: string;
  category?: string;
  categoryText?: string;
  icon?: string;
  imageUrl?: string;
  coverUrl?: string | null;
  summary?: string;
  readingMinutes?: number;
  tags?: string[];
  date?: string;
  publishedAt?: string;
};

const SEARCH_INPUT_SELECTOR = '.search input';
const SEARCH_RESULTS_ID = 'search-results';
const SEARCH_CONTAINER_SELECTOR = '.search';
const POSTS_LIST_SELECTOR = '.posts-list';
const FILTER_SELECTOR = '.filter';
const SEARCH_TOGGLE_SELECTOR = '.header__search-toggle';

type SearchWindow = Window & {
  __SEARCH_CATEGORY_SEGMENTS__?: unknown;
  __ASTRO_BASE_PATH__?: unknown;
  __SEARCH_STRINGS__?: Partial<SearchStrings>;
  __SEARCH_CATEGORY_LABELS__?: Record<string, string>;
};

type SearchStrings = {
  resultsHeading: string;
  noResults: string;
  allPosts: string;
};

const DEFAULT_SEARCH_STRINGS: SearchStrings = {
  resultsHeading: 'Search results',
  noResults: 'No results found',
  allPosts: 'All posts',
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const getCategorySlugs = (): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const segments = (window as SearchWindow).__SEARCH_CATEGORY_SEGMENTS__;
  if (!Array.isArray(segments)) {
    return [];
  }

  return segments
    .map((segment) =>
      typeof segment === 'string'
        ? segment.trim().replace(/^\//, '').replace(/\/$/, '')
        : '',
    )
    .filter((segment): segment is string => Boolean(segment));
};

const getBasePath = (): string => {
  if (typeof window === 'undefined') {
    return '/';
  }

  const raw = (window as SearchWindow).__ASTRO_BASE_PATH__;
  if (typeof raw !== 'string' || !raw.length) {
    return '/';
  }

  return raw.endsWith('/') ? raw : `${raw}/`;
};

let postsCache: SearchPost[] | null = null;
let debounceTimer: number | undefined;

const getSearchStrings = (): SearchStrings => {
  if (typeof window === 'undefined') {
    return DEFAULT_SEARCH_STRINGS;
  }

  const raw = (window as SearchWindow).__SEARCH_STRINGS__;
  if (!raw) {
    return DEFAULT_SEARCH_STRINGS;
  }

  return {
    resultsHeading: typeof raw.resultsHeading === 'string' && raw.resultsHeading.length
      ? raw.resultsHeading
      : DEFAULT_SEARCH_STRINGS.resultsHeading,
    noResults: typeof raw.noResults === 'string' && raw.noResults.length
      ? raw.noResults
      : DEFAULT_SEARCH_STRINGS.noResults,
    allPosts: typeof raw.allPosts === 'string' && raw.allPosts.length
      ? raw.allPosts
      : DEFAULT_SEARCH_STRINGS.allPosts,
  };
};

const getCategoryLabels = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {};
  }

  const raw = (window as SearchWindow).__SEARCH_CATEGORY_LABELS__;
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  return raw;
};

const loadPosts = async (): Promise<SearchPost[]> => {
  if (postsCache) {
    return postsCache;
  }

  const normalizedBasePath = getBasePath();
  const searchIndexUrl = new URL(`${normalizedBasePath}search.json`, window.location.origin);
  const response = await fetch(searchIndexUrl.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch search index: ${response.status}`);
  }

  postsCache = await response.json();
  return postsCache ?? [];
};

const resetSearchView = (
  resultsContainer: HTMLElement,
  postsListContainer: HTMLElement | null,
  filterContainer: HTMLElement | null,
) => {
  resultsContainer.innerHTML = '';
  resultsContainer.style.display = 'none';
  if (postsListContainer) {
    postsListContainer.style.display = '';
  }
  if (filterContainer) {
    filterContainer.style.display = '';
  }
};

const renderResults = (
  posts: SearchPost[],
  resultsContainer: HTMLElement,
  contextCategory: string | null,
) => {
  const strings = getSearchStrings();
  const categoryLabels = getCategoryLabels();
  const categoryTitle = contextCategory
    ? categoryLabels[contextCategory] ?? contextCategory
    : strings.allPosts;

  const headerTitle = categoryTitle
    ? `${strings.resultsHeading}: ${categoryTitle}`
    : strings.resultsHeading;

  const header = `
<div class="section-head">
  <h2 class="section-head__title">${escapeHtml(headerTitle)}</h2>
  <span class="section-head__count">${String(posts.length).padStart(2, '0')} ${posts.length === 1 ? 'post' : 'posts'}</span>
</div>`;

  if (!posts.length) {
    resultsContainer.innerHTML = `${header}<div class="no-posts">${escapeHtml(strings.noResults)}</div>`;
    return;
  }

  const markup = posts
    .map((post) => {
      const categoryText = post.categoryText ?? post.category ?? '';
      const date = post.publishedAt ? post.publishedAt.slice(0, 10).replace(/-/g, '.') : post.date ?? '';
      const meta = [
        categoryText ? `<span class="post__meta-category">${escapeHtml(categoryText)}</span>` : '',
        `<span>${escapeHtml(date)}</span>`,
        post.readingMinutes ? `<span>${post.readingMinutes} min</span>` : '',
      ]
        .filter(Boolean)
        .join('<span>·</span>');
      const tags = (post.tags ?? [])
        .map((tag) => `<span class="post__tag">#${escapeHtml(tag)}</span>`)
        .join('');
      const thumbnail = post.coverUrl
        ? `<div class="post__thumbnail"><img src="${post.coverUrl}" alt="" loading="lazy"></div>`
        : '';

      return `
<a href="${post.url}" class="post">
  <div class="post__content">
    <div class="post__meta">${meta}</div>
    <h3 class="post__title">${escapeHtml(post.title)} <span class="material-symbols-rounded post__arrow" aria-hidden="true">arrow_forward</span></h3>
    ${post.summary ? `<p class="post__summary">${escapeHtml(post.summary)}</p>` : ''}
    ${tags ? `<div class="post__tags">${tags}</div>` : ''}
  </div>
  ${thumbnail}
</a>`;
    })
    .join('');

  resultsContainer.innerHTML = `${header}${markup}`;
};

const getCurrentContext = (config: ReturnType<typeof getLocaleConfig>) => {
  const path = window.location.pathname;
  const lang = getLanguageFromPath(path, config);
  const normalizedLang = normalizeLanguage(lang, config);
  const normalizedPath = stripLanguageFromPath(path, normalizedLang, config);
  const slugs = getCategorySlugs();
  const category = slugs.find((slug) => normalizedPath.startsWith(`/${slug}`)) ?? null;
  return { lang: normalizedLang, category };
};

const debounce = (callback: () => void, delay: number) => {
  if (debounceTimer) {
    window.clearTimeout(debounceTimer);
  }
  debounceTimer = window.setTimeout(callback, delay);
};

export const initSearch = () => {
  const searchInput = document.querySelector<HTMLInputElement>(SEARCH_INPUT_SELECTOR);
  const resultsContainer = document.getElementById(SEARCH_RESULTS_ID);
  if (!searchInput || !resultsContainer) {
    return;
  }

  if (searchInput.dataset.searchInit === 'true') {
    return;
  }
  searchInput.dataset.searchInit = 'true';

  const postsListContainer = document.querySelector<HTMLElement>(POSTS_LIST_SELECTOR);
  const filterContainer = document.querySelector<HTMLElement>(FILTER_SELECTOR);
  const searchContainer = document.querySelector<HTMLElement>(SEARCH_CONTAINER_SELECTOR);
  const searchToggle = document.querySelector<HTMLButtonElement>(SEARCH_TOGGLE_SELECTOR);

  const config = getLocaleConfig();

  const showResults = (posts: SearchPost[], contextCategory: string | null) => {
    resultsContainer.style.display = 'block';
    if (postsListContainer) {
      postsListContainer.style.display = 'none';
    }
    if (filterContainer) {
      filterContainer.style.display = 'none';
    }
    renderResults(posts, resultsContainer, contextCategory);
  };

  const handleSearchTerm = async () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) {
      resetSearchView(resultsContainer, postsListContainer, filterContainer);
      return;
    }

    try {
      const posts = await loadPosts();
      const { lang, category } = getCurrentContext(config);

      const filtered = posts.filter((post) => {
        const matchesLang = normalizeLanguage(post.lang, config) === lang;
        const matchesCategory = !category || post.category === category;
        const content = `${post.title} ${post.content ?? ''}`.toLowerCase();
        const matchesTerm = content.includes(searchTerm);
        return matchesLang && matchesCategory && matchesTerm;
      });

      showResults(filtered, category);
    } catch (error) {
      console.error(error);
    }
  };

  searchInput.addEventListener('input', () => {
    debounce(handleSearchTerm, 300);
  });

  if (searchToggle && searchContainer) {
    searchContainer.classList.toggle('hidden', true);
    resultsContainer.style.display = 'none';

    if (searchToggle.dataset.searchToggleInit !== 'true') {
      searchToggle.dataset.searchToggleInit = 'true';
      document.addEventListener('keydown', (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          if (searchContainer.classList.contains('hidden')) {
            searchToggle.click();
          } else {
            searchInput.focus();
          }
        }
      });

      searchToggle.addEventListener('click', () => {
        const isHidden = searchContainer.classList.toggle('hidden');
        if (isHidden) {
          resetSearchView(resultsContainer, postsListContainer, filterContainer);
          searchInput.value = '';
        } else {
          resultsContainer.style.display = 'none';
          searchInput.focus();
        }
      });
    }
  }

  resetSearchView(resultsContainer, postsListContainer, filterContainer);
};
