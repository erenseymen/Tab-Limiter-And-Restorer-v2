function onTabActivated({ tabId, windowId }) {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const index = tabs.find((tab) => tab.active).index;
    if (activeTabHistory[windowId]) {
      return (activeTabHistory[windowId] = [
        ...activeTabHistory[windowId].slice(-1),
        { tabId, index },
      ]);
    }
    activeTabHistory[windowId] = [{ tabId, index }];
  });

  setBadge(windowId);
}
