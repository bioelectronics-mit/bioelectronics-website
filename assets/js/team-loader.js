/**
 * Team page data loader
 *
 * HOW TO ADD A MEMBER:
 *   1. Create data/members/[slug].json  (copy an existing file as template)
 *   2. Add the slug to the appropriate group in data/members/index.json
 *
 * HOW TO MOVE SOMEONE TO ALUMNI:
 *   1. Remove their slug from data/members/index.json
 *   2. Add an entry to data/members/alumni.json
 *   3. Optionally delete the individual .json file
 */

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load ' + url);
  return res.json();
}

async function loadMemberFiles(slugs) {
  return Promise.all(slugs.map(async s => {
    const data = await fetchJSON('data/members/' + s + '.json');
    return { ...data, _slug: s };
  }));
}

/* ── Render PI ─────────────────────────────────────────────── */
function renderPI(member) {
  const container = document.getElementById('pi-container');
  if (!container) return;

  const photo = member.photo
    ? `<div class="pic"><a href="polina.html"><img src="${member.photo}" class="img-fluid" alt="${member.name}"
         onerror="this.parentElement.parentElement.style.display='none'" style="cursor:pointer;"></a></div>`
    : '';

  const roles = (member.roles || []).map(r => `<span class="d-block">${r}</span>`).join('');
  const email = member.email
    ? `<span class="d-block" style="margin-top:8px;"><i>${member.email}</i></span>` : '';
  const scholar = member.scholar
    ? `<span class="d-block"><a target="_blank" href="${member.scholar}">Google Scholar</a></span>` : '';

  container.innerHTML = `
    <div class="row no-gutters" style="margin-bottom:40px;">
      <div class="content col-xl-3 col-md-4">${photo}</div>
      <div class="col-xl-9 col-md-8" style="padding:20px 30px;">
        <h4 style="margin-bottom:4px;">${member.name}</h4>
        ${roles}${email}${scholar}
        <span style="margin-top:8px;display:block;"><a href="polina.html" class="btn btn-sm" style="font-size:0.75rem;padding:2px 10px;">More info</a></span>
      </div>
    </div>`;
}

/* ── Social icons for a member ─────────────────────────────── */
function socialIconsHTML(member) {
  const icons = [];
  if (member.email)
    icons.push(`<a href="mailto:${member.email}" target="_blank" title="Email" style="color:#3B66E8;margin:0 4px;font-size:1rem;"><i class="bi bi-envelope-fill"></i></a>`);
  if (member.linkedin)
    icons.push(`<a href="${member.linkedin}" target="_blank" title="LinkedIn" style="color:#3B66E8;margin:0 4px;font-size:1rem;"><i class="bi bi-linkedin"></i></a>`);
  if (member.scholar)
    icons.push(`<a href="${member.scholar}" target="_blank" title="Google Scholar" style="color:#3B66E8;margin:0 4px;font-size:1rem;"><i class="bi bi-mortarboard-fill"></i></a>`);
  if (member.twitter)
    icons.push(`<a href="${member.twitter}" target="_blank" title="Twitter/X" style="color:#3B66E8;margin:0 4px;font-size:1rem;"><i class="bi bi-twitter-x"></i></a>`);
  if (!icons.length) return '';
  return `<div style="margin-top:6px;">${icons.join('')}</div>`;
}

/* ── Member card (Staff / Postdoc / Grad student) ─────────── */
function memberCardHTML(member, delay) {
  const link = member._slug ? `member.html?id=${member._slug}` : '#';
  const photo = member.photo
    ? `<a href="${link}"><img src="${member.photo}" class="img-fluid" alt="${member.name}"
         onerror="this.parentElement.style.display='none'"></a>`
    : '';

  let info = `<h4><a href="${link}" style="color:inherit;text-decoration:none;">${member.name}</a></h4>`;
  if (member.role)       info += `<span>${member.role}</span>`;
  if (member.department) info += `<span>${member.department}</span>`;
  info += socialIconsHTML(member);
  info += `<span style="margin-top:4px;"><a href="${link}" class="btn btn-sm" style="font-size:0.75rem;padding:2px 10px;">More info</a></span>`;

  return `
    <div class="col-lg-3 col-md-4 col-6">
      <div class="member">
        <div class="pic">${photo}</div>
        <div class="member-info">${info}</div>
      </div>
    </div>`;
}

function sortByLastName(members) {
  return [...members].sort((a, b) => {
    const lastA = a.name.trim().split(/\s+/).pop().toLowerCase();
    const lastB = b.name.trim().split(/\s+/).pop().toLowerCase();
    return lastA.localeCompare(lastB);
  });
}

function renderMemberCards(containerId, members) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const sorted = sortByLastName(members);
  const delays = [0, 150, 300, 450];
  el.innerHTML = sorted.map((m, i) => memberCardHTML(m, delays[i % 4])).join('');
}

/* ── Undergrad list ────────────────────────────────────────── */
function renderUndergrads(members) {
  const el = document.getElementById('undergrad-list');
  if (!el) return;
  el.innerHTML = sortByLastName(members).map(m => {
    let text = `<b>${m.name}</b>`;
    if (m.institution) text += `, ${m.institution}`;
    if (m.major)       text += ` — ${m.major}`;
    if (m.mentor)      text += ` (Mentor: ${m.mentor})`;
    return `<li>${text}</li>`;
  }).join('');
}

/* ── Alumni ────────────────────────────────────────────────── */
function renderAlumni(alumni) {
  const el = document.getElementById('alumni-container');
  if (!el) return;

  const postdocs = alumni.filter(a => a.type === 'Postdoctoral');
  const grads    = alumni.filter(a => a.type === 'Graduate Student');
  const others   = alumni.filter(a => a.type === 'Other');

  function listHTML(items) {
    return '<ul>' + items.map(a => {
      let text = `<b>${a.name}</b>`;
      if (a.currentPosition) text += ` — ${a.currentPosition}`;
      if (a.note) text += ` (${a.note})`;
      return `<li>${text}</li>`;
    }).join('') + '</ul>';
  }

  el.innerHTML = `
    <div class="grouping"><h4>Postdoctoral Researchers</h4></div>
    <div class="content">${listHTML(postdocs)}</div>
    <div class="grouping"><h4>Graduate Students</h4></div>
    <div class="content">${listHTML(grads)}</div>
    <div class="grouping"><h4>Undergraduate Students &amp; Visiting Researchers</h4></div>
    <div class="content">${listHTML(others)}</div>`;
}

/* ── Main loader ───────────────────────────────────────────── */
async function loadTeam() {
  try {
    const { groups } = await fetchJSON('data/members/index.json');

    const [pi] = await loadMemberFiles(groups['Principal Investigator']);
    renderPI(pi);

    renderMemberCards('staff-container',
      await loadMemberFiles(groups['Staff']));

    renderMemberCards('postdoc-container',
      await loadMemberFiles(groups['Postdoctoral Associates & Fellows']));

    renderMemberCards('grad-container',
      await loadMemberFiles(groups['Graduate Students']));

    renderUndergrads(
      await loadMemberFiles(groups['Undergraduate Students']));

    renderAlumni(await fetchJSON('data/members/alumni.json'));

    // AOS.refresh() disabled
  } catch (err) {
    console.error('Team loader error:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadTeam);
