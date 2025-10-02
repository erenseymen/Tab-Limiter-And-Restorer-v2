chrome.storage.sync.get(null, (storage) => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const { windowId } = tabs[0];
    popup({ storage, windowId, visibleTabs: tabs });
  });
});

let hiddenTabs = [];

function popup({ storage, windowId, visibleTabs }) {
  const listHiddenTabs = document.getElementById('listHiddenTabs');

  // Theme switcher
  const themeSwitcher = document.getElementById('theme-switcher-checkbox');
  const currentTheme = storage.theme || 'light';
  document.body.setAttribute('data-theme', currentTheme);
  themeSwitcher.checked = currentTheme === 'dark';

  themeSwitcher.addEventListener('change', (evt) => {
    const theme = evt.target.checked ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
    chrome.storage.sync.set({ theme });
  });

  // Restore Queued Tabs button
  const restoreQueuedTabsBtn = document.getElementById('restoreQueuedTabsBtn');
  // Show button if there are queued tabs
  chrome.storage.sync.get('queuedTabs', ({ queuedTabs }) => {
    let hasQueued = false;
    if (queuedTabs) {
      Object.values(queuedTabs).forEach(tabs => {
        if (tabs && tabs.length) hasQueued = true;
      });
    }
    restoreQueuedTabsBtn.style.display = hasQueued ? 'block' : 'none';
  });
  restoreQueuedTabsBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'restore-queued-tabs' }, (response) => {
      if (response && response.success) {
        restoreQueuedTabsBtn.style.display = 'none';
      }
    });
  });

  const inputActive = document.getElementById('inputActive');
  inputActive.checked = storage.active;
  inputActive.addEventListener('change', (evt) => {
    chrome.storage.sync.set({ active: evt.target.checked });
  });

  const inputTabsVisible = document.getElementById('inputTabsVisible');
  inputTabsVisible.value = storage.tabsVisible;
  inputTabsVisible.addEventListener('change', (evt) => {
    const newValue = Math.max(1, evt.target.value);
    chrome.storage.sync.set({ tabsVisible: newValue }, () => {
      inputTabsVisible.value = newValue;
    });
  });

  const inputModeQueueNew = document.getElementById('inputModeQueueNew');
  inputModeQueueNew.checked = storage.mode === 'queueNew';
  inputModeQueueNew.addEventListener('change', (evt) => {
    chrome.storage.sync.set({ mode: evt.target.value });
    storage.mode = evt.target.value;
  });

  const inputModeStackOld = document.getElementById('inputModeStackOld');
  inputModeStackOld.checked = storage.mode === 'stackOld';
  inputModeStackOld.addEventListener('change', (evt) => {
    chrome.storage.sync.set({ mode: evt.target.value });
    storage.mode = evt.target.value;
  });

  // Show hidden tabs
  chrome.runtime.sendMessage(
    { action: 'get-hidden-tabs', windowId },
    ({ tabs }) => {
      const msgNoHiddenTabs = document.getElementById('msgNoHiddenTabs');

      if (!tabs || !tabs.length) {
        return (msgNoHiddenTabs.style.display = 'block');
      }

      hiddenTabs = tabs;
      msgNoHiddenTabs.style.display = 'none';

      tabs.forEach((tab) => {
        const li = document.createElement('li');
        li.innerHTML = /* html */ `
          <div>${tab.title || tab.pendingUrl}</div>
          <div>
            <button id="buttonDeleteHiddenTab" class="delete is-medium"></button>
          </div>
        `;
        li.dataset.id = tab.id;
        li.dataset.url = tab.url || tab.pendingUrl;
        li.title = tab.title && tab.url;
        listHiddenTabs.appendChild(li);
      });
    }
  );

  // On Hidden Tabs List Click
  listHiddenTabs.addEventListener('click', (evt) => {
    const tabId = parseInt(evt.target.closest('li').dataset.id);
    const tabUrl = evt.target.closest('li').dataset.url;
    const li = evt.target.closest('li');

    if (!(tabId >= 0)) return;

    // Remove hidden tab
    if (evt.target.id === 'buttonDeleteHiddenTab') {
      evt.stopPropagation();
      chrome.runtime.sendMessage({
        action: 'remove-hidden-tab',
        tabId,
        windowId,
      });
      return li.remove();
    }

    // Open hidden tab
    chrome.runtime.sendMessage(
      { action: 'remove-hidden-tab', tabId, windowId },
      (response) => {
        chrome.tabs.create({
          active: !(evt.ctrlKey || evt.metaKey),
          url: tabUrl,
          index: storage.mode === 'stackOld' ? visibleTabs.length : 0,
        });
        li.remove();
      }
    );
  });
}
