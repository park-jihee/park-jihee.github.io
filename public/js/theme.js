(() => {
  const storageKey = 'theme';
  const darkClass = 'dark-mode';
  const doc = document.documentElement;

  try {
    const stored = localStorage.getItem(storageKey);
    const isStored = stored === 'dark' || stored === 'light';
    const mode = isStored ? stored : 'light';

    if (mode === 'dark') {
      doc.classList.add(darkClass);
    } else {
      doc.classList.remove(darkClass);
    }

    doc.dataset.theme = mode;
  } catch (err) {
    // Swallow storage access issues silently.
  }
})();
