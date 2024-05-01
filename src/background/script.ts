chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const keyInLocalStorage = 'pre_tab_' + tabId;

    const value = await chrome.storage.local.get(keyInLocalStorage);

    const history: { url: string | undefined, title: string | undefined }[] = value[keyInLocalStorage] || [];

    if (history.length > 0 && history[history.length - 1].url === changeInfo.url) return;

    if (tab.url === changeInfo.url && tab.status && tab.status === 'loading') {
      for (let i = 0; i < 15; i++) {
        const gotTab = await chrome.tabs.get(tabId);

        if (gotTab.url !== changeInfo.url) {
          history.push({ url: changeInfo.url, title: tab.title + ' ' + 'againChanged' });
          break;
        }

        if (gotTab.status !== 'loading') {
          history.push({ url: gotTab.url, title: gotTab.title + ' ' + 'againSucceed' + i.toString() });
          break;
        }
        if (i === 14) {
          history.push({ url: gotTab.url, title: gotTab.title + ' ' + 'againFailed' });
          break;
        }

        await delay(400);
      }
    } else {
      history.push({ url: changeInfo.url, title: tab.title + ' first' });
    }

    await chrome.storage.local.set({ [keyInLocalStorage]: history });
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const keyInLocalStorage = 'pre_tab_' + tabId;
  await chrome.storage.local.remove(keyInLocalStorage);
});

function delay(milliseconds: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}
