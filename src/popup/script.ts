document.addEventListener("DOMContentLoaded", async () => {
  const saveCurrentTabElement = document.getElementById('saveCurrentTab');
  if (saveCurrentTabElement)
    saveCurrentTabElement.onclick = async () => await saveCurrentTab();

  const clearSavedElement = document.getElementById('clearSaved');
  if (clearSavedElement)
    clearSavedElement.onclick = async () => await clearSaved();

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
  const keyInLocalStorage = 'pre_tab_' + tabId;
  const savedTabInfo = await chrome.storage.local.get(keyInLocalStorage);
  if (savedTabInfo)
    return savedTabInfo[keyInLocalStorage] || [];
  else
    return [];
}

async function saveGroup(id: string, group: { name: string, saved_date: string, tabs: { history: { url: string | undefined, title: string | undefined }[] }[] }) {
  await chrome.storage.local.set({ [id]: group });
  const savedValue = await chrome.storage.local.get('saved');
  const saved: string[] = savedValue['saved'] || [];
  saved.push(id);
  await chrome.storage.local.set({ ['saved']: saved });
}

async function isInLocalStorage(key: string) {
  const value = await chrome.storage.local.get(key);
  return !!value[key];
}

async function saveCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length === 0) return;

  const currentTab = tabs[0];
  if (!currentTab.id) return;

  const tabHistory = await getTabHistory(currentTab.id);

  let id = 'saved_tab_' + currentTab.id;
  if (await isInLocalStorage(id)) {
    for (let i = 2; i < 1000; i++) {
      id = 'saved_tab_' + currentTab.id + '_' + i;
      if (!await isInLocalStorage(id)) break;
      if (i === 99) return;
    }
  }

  const data = {
    name: currentTab.title || '',
    saved_date: convertDateToString(new Date()),
    tabs: [{ history: tabHistory }]
  };
  await saveGroup(id, data);
}

async function clearSaved() {
  const savedValue = await chrome.storage.local.get('saved');
  const saved: string[] = savedValue['saved'] || [];
  saved.forEach(async (id) => {
    await chrome.storage.local.remove(id);
  });
  await chrome.storage.local.remove('saved');
}

function convertDateToString(date: Date) {
  return `${date.getFullYear()}-${zeroPadding(date.getMonth() + 1, 2)}-${zeroPadding(date.getDate(), 2)} ${zeroPadding(date.getHours(), 2)}:${zeroPadding(date.getMinutes(), 2)}:${zeroPadding(date.getSeconds(), 2)}`;

  function zeroPadding(num: number, length: number) {
    return ('0000000000' + num).slice(-length);
  }
}
