# Millang Media

Web design agency building websites for local tradespeople. Based in Des Moines, Iowa. Starting with plumbers.

## What Is This

This repo contains:
- The Millang Media agency landing page (`index.html`)
- Client website templates (`templates/`)
- Prospect and competitor data (`data/`)

---

## Directory Structure

```
millang-media/
├── index.html                    # Millang Media agency website (millangmedia.com)
├── README.md                     # This file
├── templates/
│   └── plumber/
│       └── index.html            # Template for plumber clients
└── data/
    ├── prospects.csv             # Plumbers without websites — your leads
    └── competitors.csv           # Top competitors with websites — study these
```

---

## How to Deploy a New Client Site

1. **Copy the template folder**
   ```
   cp -r templates/plumber/ clients/[business-slug]/
   ```
   Example: `clients/streamline-plumbing/`

2. **Open the HTML file and search for these placeholders** — replace every one:
   - `[Business Name]` — the business's actual name
   - `[City]` — their city (e.g., Grimes, Waukee, Des Moines)
   - `[Owner Name]` — owner's first and last name
   - `(555) 000-0000` — their real phone number
   - `[Street Address]` and `[ZIP]` — their address
   - `[YEAR]` — year they founded the business
   - `[X]` — years in business
   - `info@[yourdomain].com` — their email

3. **Swap out placeholder content:**
   - Replace the 3 placeholder reviews with real Google reviews
   - Update the cities served list under Service Area
   - Replace the map placeholder with a real Google Maps embed (instructions in the HTML comment)
   - Replace the owner photo placeholder with a real photo

4. **Update `<title>` and `<meta name="description">`** at the top of the file with real info.

5. **Deploy** — upload to any static host:
   - Netlify Drop (drag and drop — free)
   - GitHub Pages (free)
   - Hostinger / GoDaddy / Bluehost (paid, ~$5/mo)
   - Point the client's domain to wherever you host it

---

## How to Customize the Plumber Template

All placeholder variables are marked in HTML comments like `<!-- PHONE: Replace phone number -->`.

The full list of things to replace:

| Placeholder | Where | What to Put |
|-------------|-------|-------------|
| `[Business Name]` | Title, nav, hero, about, footer | Client's business name |
| `[City]` | Multiple places | Client's city |
| `[Owner Name]` | About section, photo caption | Owner's name |
| `(555) 000-0000` | All call buttons, nav, sticky CTA | Client's real phone number |
| `[Street Address]` | Contact section, footer | Street address |
| `[ZIP]` | Contact section, footer | ZIP code |
| `[YEAR]` | About, footer tagline | Year founded |
| `[X]` | Hero trust bar, about creds | Years in business |
| `info@[yourdomain].com` | Contact section, footer | Business email |
| Review text | Reviews section | Copy 3 real Google reviews |
| Cities served | Service area section | Actual cities the business covers |
| Google Maps embed | Service area section | Follow the comment instructions in the HTML |
| Owner photo | About section | Replace the placeholder div with an `<img>` tag |

### Adding More Pages (Growth Plan clients)
For multi-page sites, duplicate `index.html` and create:
- `services.html` — full services list with pricing
- `about.html` — expanded story + team photos
- `contact.html` — standalone contact/booking page
- `reviews.html` — full Google review feed

Update the nav links in each file to point to the other pages.

---

## Prospect Data

`data/prospects.csv` — 33 Iowa plumbers without websites, sorted by Google rating. These are your cold outreach targets.

Status values: `NEW` → `CONTACTED` → `INTERESTED` → `PROPOSAL` → `CLIENT` → `PASSED`

Update the `status` and `last_contacted` columns as you work through them.

`data/competitors.csv` — 15 top Des Moines area plumbers WITH websites. Study their sites to understand what the market leaders are doing.
