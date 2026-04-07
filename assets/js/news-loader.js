/**
 * News page data loader
 *
 * HOW TO ADD A NEWS ITEM:
 *   1. Create data/news/{year}-{type}-{keyword}.json
 *   2. Add the filename to data/news/index.json
 *
 * JSON fields:
 *   year (int), date (string), title (string), body (HTML string), type ("paper"|"event"|"award")
 * Optional image: place data/news/images/{slug}.jpg or .png — auto-detected.
 *   Or set "image" explicitly in JSON.
 */

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load ' + url);
  return res.json();
}

/** Strip HTML tags and return plain text */
function stripHTML(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Return first 1–2 sentences (up to ~200 chars) of plain text */
function preview(html) {
  const text = stripHTML(html);
  if (!text) return '';
  // Split on sentence-ending punctuation
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let out = sentences[0];
  if (sentences[1] && (out + sentences[1]).length <= 200) out += sentences[1];
  return out.trim();
}

async function loadNews() {
  try {
    const filenames = await fetchJSON('data/news/index.json');
    const items = await Promise.all(filenames.map(async f => {
      const data = await fetchJSON('data/news/' + f);
      data._slug = f.replace(/\.json$/, '');
      return data;
    }));

    // Group by year descending
    const byYear = {};
    for (const item of items) {
      if (!byYear[item.year]) byYear[item.year] = [];
      byYear[item.year].push(item);
    }
    const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

    const container = document.getElementById('news-container');
    if (!container) return;

    const imgStyle = 'max-height:180px;border-radius:4px;margin-top:8px;';

    container.innerHTML = years.map(year => {
      const listItems = byYear[year].map(item => {
        const slug = item._slug;
        const detailURL = `news-item.html?id=${encodeURIComponent(slug)}`;

        // Image: explicit → auto jpg → auto png → none
        let img = '';
        if (item.image) {
          img = `<div><img src="${item.image}" style="${imgStyle}" alt="" onerror="this.parentElement.style.display='none'"></div>`;
        } else {
          img = `<div><img src="data/news/images/${slug}.jpg" style="${imgStyle}" alt=""
            onerror="if(this.src.includes('.jpg')){this.src='data/news/images/${slug}.png'}else{this.parentElement.style.display='none'}"></div>`;
        }

        // Preview text (1–2 sentences)
        const pre = item.body ? preview(item.body) : '';
        const preHTML = pre ? `<span style="color:#555;display:block;margin-top:2px;">${pre}</span>` : '';

        // "Read more" only if body has substantial content
        const hasMore = item.body && stripHTML(item.body).length > 100;
        const more = hasMore ? `<a href="${detailURL}" style="font-size:0.85rem;">Read more →</a>` : '';

        return `<li style="margin-bottom:12px;">
          <b>${item.date}</b> —
          <a href="${detailURL}" style="font-weight:600;">${item.title}</a>
          ${preHTML}
          ${img}
          ${more}
        </li>`;
      }).join('');

      return `
        <div class="content">
          <h2>${year}</h2>
          <ul>${listItems}</ul>
        </div>`;
    }).join('');

  } catch (err) {
    console.error('News loader error:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadNews);
