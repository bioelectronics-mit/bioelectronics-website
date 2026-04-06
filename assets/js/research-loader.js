/**
 * Research page data loader
 *
 * HOW TO ADD A RESEARCH TOPIC:
 *   1. Create data/research/[id].json  (copy an existing file as template)
 *   2. Add the id string to data/research/index.json array
 *
 * HOW TO EDIT A TOPIC:
 *   Edit the corresponding data/research/[id].json file.
 */

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load ' + url);
  return res.json();
}

function topicSectionHTML(topic, isVariant) {
  const variantClass = isVariant ? ' research-variant' : '';

  const bodyHTML = (topic.body || []).map(p => `<p>${p}</p>`).join('');

  const pubsHTML = (topic.publications || []).map(p => {
    const doi = p.doi
      ? ` <a target="_blank" href="https://doi.org/${p.doi}">DOI</a>` : '';
    return `<li>${p.authors} "${p.title}" <i>${p.journal}</i> <b>${p.year}</b>.${doi}</li>`;
  }).join('');

  return `
    <section id="${topic.id}" class="research${variantClass}">
      <div class="container">
        <div class="row no-gutters">
          <div class="content col-xl-5 d-flex align-items-stretch">
            <div class="content">
              <h3>${topic.title}</h3>
              <div class="pic topic-pic">
                <img src="${topic.image}" class="img-fluid" alt="">
              </div>
            </div>
          </div>
          <div class="content col-xl-7 d-flex align-items-stretch">
            <div class="row">
              <div class="content col-md-12 d-flex flex-column">
                ${bodyHTML}
              </div>
            </div>
          </div>
        </div>
        <div class="content">
          <h4>Selected Publications</h4>
          <ul>${pubsHTML}</ul>
        </div>
      </div>
    </section>`;
}

function overviewCardHTML(topic, delay) {
  return `
    <div class="col-md-6 col-lg-4 d-flex align-items-stretch mb-5 mb-lg-0">
      <div class="icon-box"${delay ? `` : ''}>
        <div class="icon"><i class="${topic.icon || 'bx bx-brain'}"></i></div>
        <h4 class="title"><a href="#${topic.id}">${topic.id === 'magnetic' ? 'Magnetic Nanomaterials' : topic.id === 'fibers' ? 'Multifunctional Neural Interfaces' : 'Gut-Brain Axis'}</a></h4>
        <p class="description">${topic.summary || ''}</p>
      </div>
    </div>`;
}

async function loadResearch() {
  try {
    const ids    = await fetchJSON('data/research/index.json');
    const topics = await Promise.all(ids.map(id => fetchJSON('data/research/' + id + '.json')));

    // Populate overview cards
    const overviewCards = document.getElementById('overview-cards');
    if (overviewCards) {
      overviewCards.innerHTML = topics
        .map((t, i) => overviewCardHTML(t, i * 100))
        .join('');
    }

    // Populate research sections
    const container = document.getElementById('research-sections');
    if (!container) return;

    container.innerHTML = topics
      .map((topic, i) => topicSectionHTML(topic, i % 2 === 0))
      .join('');

    // AOS.refresh() disabled
  } catch (err) {
    console.error('Research loader error:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadResearch);
