/**
 * Publications page data loader
 *
 * HOW TO ADD A PUBLICATION:
 *   1. Create data/publications/{year}-{lastname}-{word}.json
 *   2. Add the filename to data/publications/index.json
 *
 * Required fields per entry:
 *   title, authors (array), year (int), journal
 * Optional:
 *   doi       – DOI string (without https://doi.org/ prefix)
 *   type      – "article" | "review" | "preprint"
 *   tags      – array of strings, e.g. ["Neural Interface", "Magnetic"]
 *   image     – path in data/publications/images/
 */

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load ' + url);
  return res.json();
}

function formatAuthors(authors) {
  if (!authors || !authors.length) return '';
  if (authors.length <= 5) return authors.join(', ');
  return authors.slice(0, 5).join(', ') + ', et al.';
}

// Consistent colors for tags – cycles through palette for unknown tags
const TAG_COLORS = [
  '#3B66E8', '#7B4FBF', '#2A9D8F', '#E76F51', '#457B9D',
  '#6D6875', '#2D6A4F', '#C77DFF', '#E9C46A', '#1D3557',
];
const tagColorMap = {};
let tagColorIdx = 0;
function tagColor(tag) {
  if (!tagColorMap[tag]) {
    tagColorMap[tag] = TAG_COLORS[tagColorIdx % TAG_COLORS.length];
    tagColorIdx++;
  }
  return tagColorMap[tag];
}

function pubItemHTML(pub) {
  const authors = formatAuthors(pub.authors);
  const doiUrl = pub.doi ? `https://doi.org/${pub.doi}` : null;

  const titleEl = doiUrl
    ? `<a href="${doiUrl}" target="_blank" class="pub-title-link">${pub.title}</a>`
    : `<span class="pub-title-text">${pub.title}</span>`;

  const metaDoi = pub.doi
    ? ` | doi:<a href="${doiUrl}" target="_blank">${pub.doi}</a>`
    : '';

  const tagsHTML = (pub.tags && pub.tags.length)
    ? `<div class="pub-tags">${pub.tags.map(t =>
        `<span class="pub-tag" style="background:${tagColor(t)}">${t}</span>`
      ).join('')}</div>`
    : '';

  // Image (explicit or auto-probed by slug)
  let imgHTML = '';
  if (pub.image) {
    imgHTML = `<div class="pub-img-wrap"><img src="${pub.image}" alt="" onerror="this.parentElement.style.display='none'"></div>`;
  } else if (pub._slug) {
    const slug = pub._slug;
    imgHTML = `<div class="pub-img-wrap"><img src="data/publications/images/${slug}.jpg" alt=""
      onerror="if(this.src.includes('.jpg')){this.src='data/publications/images/${slug}.png'}else{this.parentElement.style.display='none'}"></div>`;
  }

  const allTags = [pub.type, ...(pub.tags || [])].filter(Boolean);
  const dataAttr = allTags.map(t => `data-tag-${t.toLowerCase().replace(/\s+/g, '-')}="1"`).join(' ');

  return `
  <div class="pub-item" data-type="${pub.type || ''}" ${dataAttr}>
    ${tagsHTML}
    <div class="pub-title">${titleEl}</div>
    <div class="pub-authors">${authors}</div>
    <div class="pub-meta"><em>${pub.journal}</em>, ${pub.year}${metaDoi}</div>
    ${imgHTML}
  </div>`;
}

function buildFilterButtons(allTags) {
  if (!allTags.length) return '';
  const btns = ['All', ...allTags].map((tag, i) => {
    const active = i === 0 ? ' active' : '';
    return `<button class="pub-filter-btn${active}" data-filter="${tag === 'All' ? 'all' : tag}">${tag}</button>`;
  });
  return `<div class="pub-filters">${btns.join('')}</div>`;
}

async function loadPublications() {
  try {
    const filenames = await fetchJSON('data/publications/index.json');
    const pubs = await Promise.all(filenames.map(async f => {
      const data = await fetchJSON('data/publications/' + f);
      if (!data.image) data._slug = f.replace(/\.json$/, '');
      return data;
    }));

    // Collect all unique tags (from tags arrays only, not type)
    const tagSet = new Set();
    for (const pub of pubs) {
      if (pub.tags) pub.tags.forEach(t => tagSet.add(t));
    }
    const allTags = [...tagSet];

    // Group by year (descending)
    const byYear = {};
    for (const pub of pubs) {
      if (!byYear[pub.year]) byYear[pub.year] = [];
      byYear[pub.year].push(pub);
    }
    const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

    const container = document.getElementById('publications-container');
    if (!container) return;

    container.innerHTML =
      buildFilterButtons(allTags) +
      years.map(year => `
        <div class="pub-year-group">
          <h2 class="pub-year">${year}</h2>
          ${byYear[year].map(pubItemHTML).join('')}
        </div>`).join('');

    // Filter logic
    container.querySelectorAll('.pub-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.pub-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        container.querySelectorAll('.pub-item').forEach(item => {
          if (filter === 'all') {
            item.style.display = '';
          } else {
            const key = filter.toLowerCase().replace(/\s+/g, '-');
            item.style.display = item.getAttribute(`data-tag-${key}`) === '1' ? '' : 'none';
          }
        });

        // Hide year groups that have no visible publications
        container.querySelectorAll('.pub-year-group').forEach(group => {
          const visible = [...group.querySelectorAll('.pub-item')].some(el => el.style.display !== 'none');
          group.style.display = visible ? '' : 'none';
        });
      });
    });

  } catch (err) {
    console.error('Publications loader error:', err);
    document.getElementById('publications-container').innerHTML =
      '<p>Publications could not be loaded. Please run the site via a local server (e.g., <code>python -m http.server</code>).</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadPublications);
