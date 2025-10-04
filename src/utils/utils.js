function setBadge(windowId) {
  const text = storage.active
    ? (tabStack[windowId] && tabStack[windowId].length) || ''
    : '';

  chrome.action.setBadgeText({ text: String(text) });
  chrome.action.setBadgeBackgroundColor({
    color: '#3f50b5',
  });
}
