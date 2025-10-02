const activeTabHistory = {};
const tabStack = {};
const tabStackIds = {};

// Persist tabStack to storage whenever it changes
function persistTabStack() {
  chrome.storage.sync.set({ queuedTabs: tabStack });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(null, (storage) => {
    chrome.storage.sync.set({ ...initialStorage, ...storage });
  });
});

chrome.runtime.onMessage.addListener(
  ({ action, tabId, windowId }, sender, sendResponse) => {
    switch (action) {
      case 'get-hidden-tabs':
          return sendResponse({ tabs: tabStack[windowId] });
        case 'restore-queued-tabs':
          // Open all queued tabs for all windows
          let restored = false;
          Object.entries(tabStack).forEach(([winId, tabs]) => {
            if (tabs && tabs.length) {
              tabs.forEach(tab => {
                chrome.tabs.create({ url: tab.url || tab.pendingUrl });
              });
              tabStack[winId] = [];
              tabStackIds[winId] = new Set();
              restored = true;
            }
          });
          persistTabStack();
          return sendResponse({ success: restored });
      case 'remove-hidden-tab':
        const index = tabStack[windowId].findIndex((tab) => tab.id == tabId);
        if (index < 0) return sendResponse({ error: true });
        tabStack[windowId].splice(index, 1);
        tabStackIds[windowId].delete(tabId);
    persistTabStack();
        return sendResponse({ success: true });
    }
    return true;
  }
);

chrome.storage.onChanged.addListener((changes) => {
  function getStorageChanges(changes) {
    return [...Object.entries(changes)].reduce(
      (result, [key, { newValue }]) => {
        result[key] = newValue;
        return result;
      },
      {}
    );
  }
  Object.assign(storage, getStorageChanges(changes));
  onTabEvent();
  // If queuedTabs changed, update tabStack
  if (changes.queuedTabs) {
    Object.assign(tabStack, changes.queuedTabs.newValue);
  }
});

chrome.storage.sync.get(null, start);

function start(storageData) {
  Object.assign(storage, storageData);
  // Load queuedTabs if present
  if (storageData.queuedTabs) {
    Object.assign(tabStack, storageData.queuedTabs);
    // Rebuild tabStackIds
    Object.entries(tabStack).forEach(([winId, tabs]) => {
      tabStackIds[winId] = new Set(tabs.map(tab => tab.id));
    });
  }
  chrome.tabs.onActivated.addListener(onTabActivated);
  chrome.windows.onFocusChanged.addListener(setBadge);
  chrome.tabs.onCreated.addListener(onTabEvent);
  chrome.tabs.onRemoved.addListener(onTabEvent);
}
