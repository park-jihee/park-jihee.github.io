const MENU_ID = 'mobile-menu';
const TOGGLE_SELECTOR = '.header__menu-toggle';
const CLOSE_SELECTOR = '.mobile-menu__close';

let globalListenersAttached = false;

const setMenuOpen = (open: boolean) => {
  const menu = document.getElementById(MENU_ID);
  if (!menu) {
    return;
  }

  menu.classList.toggle('active', open);
  menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  // The menu covers the whole screen, so the page behind it should not scroll
  document.body.classList.toggle('lock', open);
};

const closeMenu = () => setMenuOpen(false);

export const initMobileMenu = () => {
  const menu = document.getElementById(MENU_ID);
  const toggle = document.querySelector<HTMLButtonElement>(TOGGLE_SELECTOR);
  if (!menu || !toggle) {
    return;
  }

  if (toggle.dataset.mobileMenuInit !== 'true') {
    toggle.dataset.mobileMenuInit = 'true';
    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      setMenuOpen(!menu.classList.contains('active'));
    });

    menu.querySelector(CLOSE_SELECTOR)?.addEventListener('click', closeMenu);
  }

  if (!globalListenersAttached) {
    globalListenersAttached = true;
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });
    window.addEventListener(
      'resize',
      () => {
        if (window.innerWidth >= 768) {
          closeMenu();
        }
      },
      { passive: true },
    );
    document.addEventListener('astro:after-swap', closeMenu);
  }
};
