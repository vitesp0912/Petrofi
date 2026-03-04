# SEO Implementation (PetroFi)

This document describes the technical and on-page SEO setup for the PetroFi marketing site.

## Technical SEO

### Meta & document (`public/index.html`)

- **Primary meta**: `<title>`, `<meta name="description">`, `<meta name="robots" content="index, follow">`, `<link rel="canonical" href="https://petrofi.in/">`
- **Language**: `html lang="en-IN"` for India English
- **Open Graph**: `og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:image:alt`, `og:site_name`, `og:locale`
- **Twitter Card**: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`
- **Geo**: `meta name="geo.region" content="IN"` for India targeting

### Structured data (JSON-LD)

- **Organization**: name, url, logo, description, email, contactPoint (phone, areaServed), sameAs (App Store, Play Store)
- **WebSite**: name, url, description, publisher, inLanguage
- **SoftwareApplication**: name, applicationCategory, operatingSystem, description, offers (free), downloadUrl

Edit the `<script type="application/ld+json">` block in `index.html` when changing brand or contact details.

### Crawler files

- **`public/robots.txt`**: Allows all, references sitemap at `https://petrofi.in/sitemap.xml`
- **`public/sitemap.xml`**: Single URL `https://petrofi.in/` with lastmod, changefreq, priority
- **`public/llms.txt`**: LLM-friendly summary and links for AI visibility

Update `sitemap.xml` lastmod when you make meaningful content changes.

---

## On-page SEO

### Document structure

- **One H1 per page**: Hero section (`HeroSection.jsx`) contains the single `<h1>` (petrol pump value proposition).
- **Heading hierarchy**: Sections use `<h2>` for section titles; subsections use `<h3>` (e.g. problem cards, module cards, benefits). No heading levels are skipped.
- **Landmarks**: `<main id="main-content" aria-label="Main content">` in `App.js`; skip link “Skip to main content” in `index.html` (visible on keyboard focus).

### Sections and accessibility

Key sections have `aria-labelledby` pointing to their main heading for clarity and screen readers:

| Section            | Heading id             | Section `aria-labelledby` |
|--------------------|------------------------|---------------------------|
| Problem            | `problem-heading`      | `problem-heading`         |
| Features / Modules  | `features-heading`     | `features-heading`        |
| Screenshots        | `screenshots-heading`  | `screenshots-heading`     |
| Download           | `download-heading`     | `download-heading`        |
| Benefits           | `benefits-heading`     | `benefits-heading`        |
| Demo               | `demo-heading`         | `demo-heading`            |

Section IDs used for in-page links: `#features`, `#how-it-works`, `#screenshots`, `#download`, `#demo`, `#problem`, `#hero`.

### Images

- **Hero**: Decorative logo watermark uses `alt=""` and `aria-hidden="true"`.
- **Content images**: Descriptive `alt` (e.g. “PetroFi mobile app”, screenshot titles in carousel).
- **Logos**: Navbar and footer logo use `alt="PetroFi Logo"` / `alt="PetroFi"`.

---

## Optional improvements

- Add a dedicated **OG/Twitter image** (e.g. `public/og-image.png`, 1200×630) and point `og:image` and `twitter:image` to `https://petrofi.in/og-image.png`.
- If you add more pages, extend **sitemap.xml** and consider **BreadcrumbList** or **FAQPage** JSON-LD where relevant.
- Keep **llms.txt** in sync with product and contact changes.
