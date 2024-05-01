chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const keyInLocalStorage = 'tab_' + tabId;

    const value = await chrome.storage.local.get(keyInLocalStorage);

    const history: { url: string | undefined, title: string | undefined }[] = value[keyInLocalStorage] || [];

    if (history.length > 0 && history[history.length - 1].url === changeInfo.url) return;

    history.push({ url: changeInfo.url, title: tab.title });

    await chrome.storage.local.set({ [keyInLocalStorage]: history });
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const keyInLocalStorage = 'tab_' + tabId;
  await chrome.storage.local.remove(keyInLocalStorage);
});
