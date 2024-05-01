document.addEventListener("DOMContentLoaded", async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tabs.length === 0) return;

  const activeTab = tabs[0];

  if (!activeTab.id) return;

  const tabHistory = await getTabHistory(activeTab.id);
  const tabHistoryElement = document.getElementById('history');
  if (tabHistoryElement) {
    tabHistoryElement.innerHTML = tabHistory.map((historyItem) => {
      return `<li><a href="${historyItem.url}">${historyItem.title}</a></li>`;
    }).join('');
  }
});

async function getTabHistory(tabId: number): Promise<{ url: string | undefined, title: string | undefined }[]> {
  const keyInLocalStorage = 'tab_' + tabId;
  const savedTabInfo = await chrome.storage.local.get(keyInLocalStorage);
  if (savedTabInfo)
    return savedTabInfo[keyInLocalStorage] || [];
  else
    return [];
}
