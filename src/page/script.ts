document.addEventListener('DOMContentLoaded', async () => {
  const saved = await chrome.storage.local.get('saved');
  const savedTabs: string[] = saved['saved'] || [];

  const savedGroupTemplate = document.getElementById('savedGroupTemplate') as HTMLTemplateElement;
  const savedTabTemplate = document.getElementById('savedTabTemplate') as HTMLTemplateElement;
  const savedTabHistoryTemplate = document.getElementById('savedTabHistoryTemplate') as HTMLTemplateElement;
  if (!savedGroupTemplate || !savedTabTemplate || !savedTabHistoryTemplate) return;

  const savedGroupsElement = document.getElementById('savedGroups');
  if (!savedGroupsElement) return;

  savedTabs.forEach(async (id, index) => {
    const group = await getSavedGroup(id);
    if (!group) return;

    const clone = document.importNode(savedGroupTemplate.content, true);

    (clone.firstElementChild as HTMLElement).id = id;

    const groupNameElement = clone.querySelector('.savedGroupName');
    if (groupNameElement) groupNameElement.textContent = group.name;

    const groupDateElement = clone.querySelector('.savedGroupDate');
    if (groupDateElement) groupDateElement.textContent = convertStringToDate(group.saved_date).toLocaleString();

    (clone.firstElementChild as HTMLElement).addEventListener('click', async () => {
      const previousSelected = document.querySelector('.selected');
      if (previousSelected && previousSelected.id !== id)
        await changeGroup(id, group);
    });

    savedGroupsElement.appendChild(clone.firstElementChild as HTMLElement);

    if (index === 0)
      await changeGroup(id, group);
  });
});

async function changeGroup(id: string, groupData: { name: string, saved_date: string, tabs: { history: { url: string | undefined, title: string | undefined }[] }[] } | undefined) {
  document.getElementById('savedTabs')!.innerHTML = '';

  const group = groupData || await getSavedGroup(id);
  if (!group) return;

  const savedTabTemplate = document.getElementById('savedTabTemplate') as HTMLTemplateElement;
  const savedTabHistoryTemplate = document.getElementById('savedTabHistoryTemplate') as HTMLTemplateElement;
  if (!savedTabTemplate || !savedTabHistoryTemplate) return;

  group.tabs.forEach((tab) => {
    const savedTabsElement = document.getElementById('savedTabs');
    if (savedTabsElement) {
      const clone = document.importNode(savedTabTemplate.content, true);

      const tabNameElement = clone.querySelector('.savedTabName');
      if (tabNameElement) tabNameElement.textContent = tab.history[0].title || '';

      const historyListElement = clone.querySelector('.savedTabHistoryList');
      if (historyListElement) {
        tab.history.slice(1).forEach((history) => {
          const historyClone = document.importNode(savedTabHistoryTemplate.content, true);

          const linkElement = historyClone.querySelector('.savedTabHistoryLink>p');
          if (linkElement) linkElement.textContent = history.title || '';

          historyListElement.appendChild(historyClone.firstElementChild as HTMLElement);
        });
      }

      savedTabsElement.appendChild(clone.firstElementChild as HTMLElement);
    }
  });

  const previousSelected = document.querySelector('.selected');
  if (previousSelected) previousSelected.classList.remove('selected');

  const selected = document.getElementById(id);
  if (selected) selected.classList.add('selected');
}

async function getSavedGroup(id: string): Promise<{ name: string, saved_date: string, tabs: { history: { url: string | undefined, title: string | undefined }[] }[] } | undefined> {
  const savedValue = await chrome.storage.local.get(id);
  if (savedValue && savedValue[id])
    return savedValue[id];
  else
    return undefined;
}

function convertStringToDate(dateString: string) {
  return new Date(dateString);
}
