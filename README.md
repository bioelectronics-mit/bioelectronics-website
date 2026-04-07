# Bioelectronics at MIT — Website

Website for the [Bioelectronics Group at MIT](https://bioelectgronics.mit.edu/).

---

## Data Structure

All editable content lives in the `data/` directory. The site has no backend — JavaScript loaders fetch JSON files directly in the browser.

```
data/
├── members/
│   ├── index.json            # Defines groups and lists member slugs
│   ├── [slug].json           # One file per current member
│   ├── alumni.json           # All alumni in a single file
│   └── images/               # Member photos ([slug].jpg or .png)
├── news/
│   ├── index.json            # Ordered list of news filenames
│   ├── [filename].json       # One file per news item
│   └── images/               # News images ([slug].jpg or .png)
└── publications/
    ├── index.json            # Ordered list of publication filenames
    ├── [filename].json       # One file per publication
    └── images/               # Paper thumbnail images
```

---

## How to Edit Content

### Members

#### Adding a new member

1. Create `data/members/[slug].json` (use an existing file as a template). The slug should be `firstname-lastname` in lowercase kebab-case (e.g., `jane-doe`).

2. Add the slug to the appropriate group in `data/members/index.json`:

```json
{
  "groups": {
    "Principal Investigator": ["polina-anikeeva"],
    "Staff": ["rebecca-leomi", "scott-machen", ...],
    "Postdoctoral Associates & Fellows": ["jane-doe", ...],
    "Graduate Students": [...],
    "Undergraduate Students": [...]
  }
}
```

3. (Optional) Add a photo to `data/members/images/[slug].jpg` (or `.png`). The loader picks it up automatically — no need to set the `photo` field unless the file is in a non-standard location.

**Member JSON fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Full name |
| `photo` | string | No | Custom image path. Omit to use auto-detected `data/members/images/[slug].jpg` |
| `role` | string | No | Position title shown on the card (e.g., `"Graduate Student"`) |
| `roles` | array of strings | No | Multiple role lines (used for the PI) |
| `department` | string | No | Department affiliation |
| `email` | string | No | Email address |
| `scholar` | string | No | Google Scholar URL |
| `linkedin` | string | No | LinkedIn URL |
| `twitter` | string | No | Twitter/X URL |
| `interests` | array of strings | No | Research keywords |
| `education` | array of objects | No | Each object: `degree`, `field`, `institution`, `year` |
| `bio` | string | No | Biographical text. Use `\n` for paragraph breaks. |
| `mentor` | string | No | Mentor name (undergrads only) |
| `major` | string | No | Major or field of study (undergrads only) |
| `institution` | string | No | Home institution (undergrads/visiting only) |

#### Moving a member to Alumni

1. Remove their slug from `data/members/index.json`.
2. Add an entry to `data/members/alumni.json`:

```json
{
  "type": "Graduate Student",
  "name": "Jane Doe",
  "currentPosition": "Postdoctoral Fellow, Harvard University",
  "note": "Ph.D. DMSE 2025",
  "yearLeft": 2025
}
```

Valid values for `type`: `"Postdoctoral"`, `"Graduate Student"`, `"Other"` (for staff, undergrads, visiting researchers).

3. You may delete the individual `[slug].json` file if desired.

#### Updating an existing member

Simply edit their `data/members/[slug].json` file directly.

---

### News

#### Adding a news item

1. Create `data/news/[filename].json`. Recommended filename format: `YYYY-MM-DD_keyword.json` (e.g., `2025-06-01_new-paper.json`).

2. Add the filename to **the top** of `data/news/index.json` (newest first):

```json
[
  "2025-06-01_new-paper.json",
  "2025-03-15_award.json",
  ...
]
```

**News JSON fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `year` | number | Yes | Year (used for grouping, e.g., `2025`) |
| `date` | string | Yes | Human-readable date (e.g., `"June 1, 2025"`) |
| `title` | string | Yes | Headline shown in the list |
| `body` | string | No | Full article content. **Accepts HTML tags** (e.g., `<p>`, `<a>`, `<b>`). Use `<p>` tags to separate paragraphs. |
| `type` | string | No | `"paper"`, `"event"`, or `"award"` |
| `image` | string | No | Custom image path. Omit to use auto-detected `data/news/images/[slug].jpg` |

> **Note:** Items with a `body` longer than 100 characters automatically get a "Read more" link that opens the full article in `news-item.html`.

> **Important:** Every filename listed in `index.json` must exist on disk. A missing file will break the entire news page.

#### Adding a news image

Place the image at `data/news/images/[slug].jpg` (or `.png`), where `[slug]` is the filename without `.json`. No changes to the JSON are needed.

---

### Publications

#### Adding a publication

1. Create `data/publications/[filename].json`. Recommended format: `YYYY-firstauthor-keyword.json` (e.g., `2025-doe-neural.json`).

2. Add the filename to the **top** of `data/publications/index.json`:

```json
[
  "2025-doe-neural.json",
  "2025-smith-magnetic.json",
  ...
]
```

**Publication JSON fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Full paper title |
| `authors` | array of strings | Yes | Author names in order. Group members can be highlighted if needed. |
| `year` | number | Yes | Publication year |
| `journal` | string | Yes | Journal or conference name |
| `doi` | string | No | DOI (without the `https://doi.org/` prefix, e.g., `"10.1038/s41586-025-00001-0"`) |
| `type` | string | No | `"article"`, `"review"`, or `"preprint"` |
| `image` | string | No | Custom image path. Omit to use auto-detected `data/publications/images/[slug].jpg` |

> **Author formatting:** If there are 5 or fewer authors, all are listed. If there are more than 5, the first 5 are shown followed by "et al."

#### Adding a publication thumbnail

Place the image at `data/publications/images/[slug].jpg` (or `.png`), where `[slug]` is the filename without `.json`.

---

### Gallery

The gallery page (`gallery.html`) is **hardcoded HTML** — there is no JSON data file or dynamic loader.

To add or update gallery images, edit `gallery.html` directly.

#### Gallery sections

| Section | Location in file | Image directory |
|---|---|---|
| Our Covers | `#covers` section | `assets/img/gallery/covers/` |
| Group Photos | `#group-photos` section | `assets/img/gallery/group-photos/` |
| Lab Retreats | `#retreats` section | `assets/img/gallery/retreats/` |

#### Adding an image

1. Place the image file in the appropriate directory above.
2. In `gallery.html`, copy an existing `<a>` / `<img>` block within the relevant section and update the `src`, `href`, and `data-glightbox` (caption) attributes.

Images use [Glightbox](https://biati-digital.github.io/glightbox/) for lightbox display. The `data-glightbox` attribute sets the caption shown in the lightbox:

```html
<a href="assets/img/gallery/group-photos/group-2025.jpg"
   class="glightbox"
   data-gallery="group-photos"
   data-glightbox="title: Group Photo 2025">
  <img src="assets/img/gallery/group-photos/group-2025.jpg"
       class="img-fluid" alt="Group Photo 2025">
</a>
```

---

## Key Files Reference

| File | Purpose |
|---|---|
| `index.html` | Home page |
| `team.html` | Team list page |
| `member.html` | Individual member detail page |
| `news.html` | News list page |
| `news-item.html` | Individual news article page |
| `publications.html` | Publications list page |
| `gallery.html` | Gallery page (hardcoded) |
| `research.html` | Research overview page |
| `assets/js/team-loader.js` | Loads and renders team/alumni data |
| `assets/js/news-loader.js` | Loads and renders news data |
| `assets/js/publications-loader.js` | Loads and renders publications data |
| `assets/css/style.css` | Main stylesheet |
