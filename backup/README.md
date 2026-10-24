# BidoMeter – project layout

Plain HTML/CSS/JS, no build step. Open `index.html` (or serve the folder) and it works.
Keep `favicon.svg`, `icon-192.png`, `apple-touch-icon.png` and `manifest.webmanifest` next to `index.html`.

## Scripts (`js/`)
Loaded in this order by `index.html`. They are classic scripts sharing one global scope (not ES modules),
so **order matters** – a file can only run code at load time that depends on files above it.

| File | What it holds |
|---|---|
| config.js | API keys/defaults, localStorage helpers, shared state (`lib`, `all`, `wl`), rating categories |
| auth.js | Supabase auth: sessions, roles, sign-in / sign-up / sign-out |
| db.js | Your library in Supabase (save / delete / load) |
| api.js | TMDB and OMDb requests |
| nav.js | Header tabs, icons, search-box submit |
| cards.js | Shared helpers: poster `card()`, `avgOf`, `num`, "view more" clamps |
| pager.js | Pagination buttons |
| dashboard.js | Dashboard hero slideshows, top actors, recently added |
| library.js | Watched screen: filters, grid/list views |
| search.js | Search for titles, actors and keywords |
| watchlist.js | To Watch screen |
| statistics.js | Statistics screen |
| quiz.js | Quiz games |
| public.js | Public (trending/popular) screen + small shared helpers |
| auth-modal.js | Log in / create account pop-up |
| account.js | Account page (change username / PIN) |
| users.js | Users list and other members' libraries |
| admin.js | Admin approvals and member removal |
| router.js | `render()` – picks which screen to show; main click handler |
| modal.js | Film/actor pop-up shell, history and scroll locking |
| watch-now.js | "Watch Now" site list |
| movie.js | Film / series detail pop-up |
| awards.js | Awards display and Wikidata lookups |
| actor.js | Actor detail pop-up |
| lightbox.js | Full-screen photo viewer |
| swipe.js | Swipe / arrow-key browsing between titles |
| boot.js | Start-up (**must stay last**) |

## Styles (`css/`)
Also order-sensitive (later files override earlier ones where they overlap):
base → components → layout → grid → library → stats → dashboard → modal → lightbox → leaderboard → quiz → watch-now → account → effects.
`effects.css` holds the glow and frosted-glass layers that sit on top of everything else.
