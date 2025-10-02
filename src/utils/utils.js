function setBadge(windowId) {
  const text = storage.active
    ? (tabStack[windowId] && tabStack[windowId].length) || ''
    : '';

  chrome.browserAction.setBadgeText({ text: String(text) });
  chrome.browserAction.setBadgeBackgroundColor({
    color: '#3f50b5',
  });
}
