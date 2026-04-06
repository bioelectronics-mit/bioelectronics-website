/**
 * News page data loader
 *
 * HOW TO ADD A NEWS ITEM:
 *   1. Create data/news/{year}-{type}-{keyword}.json
 *   2. Add the filename to data/news/index.json
 *
 * Fields per entry:
 *   year (int), date (string), text (HTML string), type ("paper"|"event"|"award")
 * Optional: image (path to image in data/news/images/)
 */

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load ' + url);
  return res.json();
}

async function loadNews() {
  try {
    const filenames = await fetchJSON('data/news/index.json');
    const items = await Promise.all(filenames.map(f => fetchJSON('data/news/' + f)));

    // Group by year (already sorted desc from index, but ensure grouping)
    const byYear = {};
    for (const item of items) {
      if (!byYear[item.year]) byYear[item.year] = [];
      byYear[item.year].push(item);
    }
    const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

    const container = document.getElementById('news-container');
    if (!container) return;

    container.innerHTML = years.map(year => {
      const yearItems = byYear[year];
      const listItems = yearItems.map(item => {
        const img = item.image
          ? `<div class="news-image" style="margin:8px 0;"><img src="${item.image}" class="img-fluid" style="max-height:200px;border-radius:4px;" alt=""></div>`
          : '';
        return `<li><b>${item.date}</b> – ${item.text}${img}</li>`;
      }).join('');
      return `
        <div class="content">
          <h2>${year}</h2>
          <ul>${listItems}</ul>
        </div>`;
    }).join('');

    // AOS.refresh() disabled
  } catch (err) {
    console.error('News loader error:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadNews);
