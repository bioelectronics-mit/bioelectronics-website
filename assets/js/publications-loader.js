/**
 * Publications page data loader
 *
 * HOW TO ADD A PUBLICATION:
 *   1. Create data/publications/{year}-{lastname}-{word}.json
 *   2. Add the filename to data/publications/index.json
 *
 * Required fields per entry:
 *   title, authors (array), year (int), journal
 * Optional: doi, type ("article" | "review" | "preprint"), image (path in data/publications/images/)
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

function pubItemHTML(pub) {
  const authors = formatAuthors(pub.authors);
  const doi = pub.doi
    ? ` <a target="_blank" href="https://doi.org/${pub.doi}">DOI</a>` : '';

  // Explicit image in JSON takes priority; otherwise auto-probe by slug (jpg → png → hidden)
  const imgStyle = 'max-height:144px;max-width:216px;object-fit:contain;border-radius:3px;box-shadow:0 1px 4px rgba(0,0,0,0.15);';
  let img = '';
  if (pub.image) {
    img = `<div style="margin-top:8px;"><img src="${pub.image}" alt="" style="${imgStyle}" onerror="this.parentElement.style.display='none'"></div>`;
  } else if (pub._slug) {
    const slug = pub._slug;
    img = `<div style="margin-top:8px;"><img src="data/publications/images/${slug}.jpg" alt="" style="${imgStyle}"
      onerror="if(this.src.includes('.jpg')){this.src='data/publications/images/${slug}.png'}else{this.parentElement.style.display='none'}"></div>`;
  }

  return `<li>${authors}. "<b>${pub.title}</b>" <i>${pub.journal}</i> <b>${pub.year}</b>.${doi}${img}</li>`;
}

async function loadPublications() {
  try {
    const filenames = await fetchJSON('data/publications/index.json');
    // Load each pub and attach the base slug (filename without .json) for image lookup
    const pubs = await Promise.all(filenames.map(async f => {
      const data = await fetchJSON('data/publications/' + f);
      if (!data.image) {
        const slug = f.replace(/\.json$/, '');
        data._slug = slug; // used to probe for image
      }
      return data;
    }));

    // Group by year (descending)
    const byYear = {};
    for (const pub of pubs) {
      if (!byYear[pub.year]) byYear[pub.year] = [];
      byYear[pub.year].push(pub);
    }
    const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

    const container = document.getElementById('publications-container');
    if (!container) return;

    container.innerHTML = years.map(year => `
      <div class="content">
        <h2>${year}</h2>
        <ul>${byYear[year].map(pubItemHTML).join('')}</ul>
      </div>`).join('');

    // AOS.refresh() disabled
  } catch (err) {
    console.error('Publications loader error:', err);
    document.getElementById('publications-container').innerHTML =
      '<p>Publications could not be loaded. Please run the site via a local server (e.g., <code>python -m http.server</code>).</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadPublications);
