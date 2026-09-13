import { apiUrl, apiHeaders, normalizeRepositories, additionalRepositories, formatDate } from '../data/github';
import type { Repository } from '../data/github';

function render(repositories: Repository[]) {
  const container = document.getElementById('repositories');
  if (!container) return;
  if (repositories.length === 0) {
    if (container.querySelector('.empty-state')?.textContent === 'No additional public projects to show.') return;
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No additional public projects to show.';
    container.replaceChildren(empty);
    return;
  }
  const list = document.createElement('ul');
  list.className = 'repository-list';
  for (const repository of repositories) {
    const item = document.createElement('li');
    const copy = document.createElement('div');
    copy.className = 'repository-copy';
    const title = document.createElement('h3');
    const link = document.createElement('a');
    link.href = repository.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = repository.name;
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = ' ↗';
    link.append(arrow);
    title.append(link);
    copy.append(title);
    if (repository.description) {
      const description = document.createElement('p');
      description.textContent = repository.description;
      copy.append(description);
    }
    const metadata = document.createElement('div');
    metadata.className = 'metadata';
    const labels = [repository.language, `${repository.stars} ${repository.stars === 1 ? 'star' : 'stars'}`];
    for (const label of labels) {
      if (!label) continue;
      const span = document.createElement('span');
      span.textContent = label;
      metadata.append(span);
    }
    const updated = document.createElement('span');
    updated.textContent = 'Updated ';
    const time = document.createElement('time');
    time.dateTime = repository.updatedAt;
    time.textContent = formatDate(repository.updatedAt);
    updated.append(time);
    metadata.append(updated);
    item.append(copy, metadata);
    list.append(item);
  }
  container.replaceChildren(list);
}

async function refresh() {
  try {
    const response = await fetch(apiUrl, { headers: apiHeaders, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return;
    render(additionalRepositories(normalizeRepositories(await response.json())));
  } catch { /* The static snapshot stays visible on timeout, invalid data, or network failure. */ }
}

// Refresh after initial layout, when this section is near the viewport.
const container = document.getElementById('repositories');
if (container && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer.disconnect();
      void refresh();
    }
  }, { rootMargin: '400px' });
  observer.observe(container);
} else { void refresh(); }
