console.log("YouTube Focus Mode content script loaded.");

const selectors = [
  '#related',
  'ytd-rich-grid-renderer',
  '.ytp-endscreen-content',
  'ytd-miniplayer',
  'ytd-reel-shelf-renderer'
];

let observer = null;

function hideDistractingElements(strictness = selectors.length) {
  selectors.forEach((selector, index) => {
    const el = document.querySelector(selector);
    if (el) {
      el.style.display = index < strictness ? 'none' : '';
    }
  });
}

function showDistractingElements() {
  selectors.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) el.style.display = '';
  });
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

function startObserver(strictness) {
  if (observer) observer.disconnect();
  observer = new MutationObserver(() => hideDistractingElements(strictness));
  observer.observe(document.body, { childList: true, subtree: true });
}

chrome.storage.local.get(['enabled', 'strictness'], (data) => {
  if (data.enabled) {
    const level = data.strictness ?? selectors.length;
    hideDistractingElements(level);
    startObserver(level);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'FOCUS_MODE_TOGGLE') {
    if (message.enabled) {
      chrome.storage.local.get(['strictness'], (data) => {
        const level = data.strictness ?? selectors.length;
        hideDistractingElements(level);
        startObserver(level);
      });
    } else {
      showDistractingElements();
    }
  }

  if (message.type === 'STRICTNESS_CHANGED') {
    chrome.storage.local.get(['enabled'], (data) => {
      if (data.enabled) {
        hideDistractingElements(message.level);
        startObserver(message.level);
      }
    });
  }
});

