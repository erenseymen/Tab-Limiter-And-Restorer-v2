function onTabEvent() {
  if (!storage.active) return;

  const modes = { queueNew, stackOld };

  modes[storage.mode]();

  function stackOld() {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const pinnedTabsLength = tabs.filter((tab) => tab.pinned).length;

      if (tabs.length - pinnedTabsLength > storage.tabsVisible) {
        const tab = tabs[pinnedTabsLength];
        pushToTabStack(tab);
        chrome.tabs.remove(tabs[pinnedTabsLength].id, () =>
          setBadge(tab.windowId)
        );
      }

      if (tabs.length - pinnedTabsLength < storage.tabsVisible) {
        chrome.windows.getCurrent(null, (currentWindow) => {
          if (chrome.runtime.lastError || !currentWindow) return;
          const windowTabs = tabStack[currentWindow.id];
          if (windowTabs && windowTabs.length) {
            const tabToRestore = windowTabs.shift();
            tabStackIds[currentWindow.id].delete(tabToRestore.id);
            chrome.tabs.create(
              {
                active:
                  getLastActiveTabIndex(currentWindow.id) === pinnedTabsLength,
                index: 0,
                url: tabToRestore.url || tabToRestore.pendingUrl,
                windowId: currentWindow.id,
              },
              () => setBadge(currentWindow.id)
            );
          }
        });
      }
    });
  }

  function queueNew() {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const pinnedTabsLength = tabs.filter((tab) => tab.pinned).length;

      if (tabs.length - pinnedTabsLength > storage.tabsVisible) {
        const tab = tabs[tabs.length - 1];
        pushToTabStack(tab);
        chrome.tabs.remove(tab.id, () => setBadge(tab.windowId));
      }

      if (tabs.length - pinnedTabsLength < storage.tabsVisible) {
        chrome.windows.getCurrent(null, (currentWindow) => {
          if (chrome.runtime.lastError || !currentWindow) return;
          const windowTabs = tabStack[currentWindow.id];
          if (windowTabs && windowTabs.length) {
            const tabToRestore = windowTabs.shift();
            tabStackIds[currentWindow.id].delete(tabToRestore.id);
            chrome.tabs.create(
              {
                active:
                  getLastActiveTabIndex(currentWindow.id) ===
                  storage.tabsVisible + pinnedTabsLength - 1,
                index: Number(storage.tabsVisible + pinnedTabsLength - 1),
                url: tabToRestore.url || tabToRestore.pendingUrl,
                windowId: currentWindow.id,
              },
              () => setBadge(currentWindow.id)
            );
          }
        });
      }
    });
  }
}

function getLastActiveTabIndex(windowId) {
  const history = activeTabHistory[windowId];
  return history && history[0].index;
}

function pushToTabStack(tab) {
  if (tabStack[tab.windowId]) {
    if (tabStackIds[tab.windowId].has(tab.id)) return;
    tabStack[tab.windowId].push(tab);
    tabStackIds[tab.windowId].add(tab.id);
  } else {
    tabStack[tab.windowId] = [tab];
    tabStackIds[tab.windowId] = new Set([tab.id]);
  }
  // Persist tabStack after update
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ queuedTabs: tabStack });
  }
}
