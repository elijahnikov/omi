# Hero Screenshot — Demo Persona Kits

Demo data for the **persona tabs above the hero image** (Research · Work · Travel · Bookmarking · Design · Learning). Each tab swaps the screenshot to a different workspace.

> Grounded in `apps/app/src/components/pages/library-page/`.

## Capture the LIBRARY page for all six

`library-page` = **`LibraryToolbar`** + **`ResourceList`** inside the sidebar + open-tabs chrome.

- **Toolbar (sticky):** search · type filter (All / Websites / Notes / Files) · order (Newest / Oldest / A–Z) · **+ New folder**.
- **Pinned section (fixed at the top, its own section):** pinned resources/collections sit here, above everything else. **Anything pinned here is also pinned in the sidebar** — same state. The main list **below excludes** pinned items (no duplication). Keep **≤ 5 pinned** or the section auto-collapses.
- **Main list (below pinned):** unpinned folders + unpinned resources, in the toolbar's sort order.
- **Resource row anatomy:** type icon / favicon (left) → title (+ optional snippet) → **uploader's avatar (right)** → pin icon on hover.
- **Sidebar:** Home / Library / Search / Chat / Tags / Journal + a **Pinned** section (mirrors the library pinned items) + your avatar.
- **Tabs:** browser-like strip, one active.

**Uploader avatars** (right of each row) are how collaboration shows on Library: solo workspaces = all your avatar; team workspaces (Work, Travel) = different members' avatars per row.

### Rules
- **Same view (Library) + identical framing for all six**: window ~1280–1440px, same sidebar width / zoom / crop.
- Light mode, scrub personal info, let favicons/og-images load, export @2x → `apps/web/public/hero/<id>.png`.
- Each persona below lists the **Pinned section** (top) then the **Main list** in exact top → bottom order.

Legend: 🌐 website · 📝 note · 📄 file · ▶️ video · 🐙 GitHub · 🖼️ image · 📁 folder · 👤 uploader avatar

---

## 1. Research 🔬 — `🔬 Longevity research`  *(solo — all 👤 you)*
**Pinned section (top + sidebar):**
1. 📁 Literature (indigo)
2. 📄 Hallmarks of Aging: An Expanding Universe — *cell.com* · `#key-paper`
3. 📝 Lit review draft

**Main list (exact order):**
1. 📁 Protocols (green)
2. 📁 Writing (amber)
3. 🌐 Rapamycin and ageing — a review — *nature.com* · `#to-read`
4. 🌐 NMN — does it work? — *examine.com* · `#supplements`
5. ▶️ Peter Attia — what moves the needle — *youtube.com* · `#video`
6. 🌐 Senolytics — recent citations — *scholar.google.com*
7. 📄 biomarkers_v3.csv

**Open tabs:** `Library` *(active)* · `Lit review draft` · `Chat — "compare rapamycin vs metformin"`
**Tags:** `#key-paper` `#to-read` `#supplements` `#protocols`

---

## 2. Work 💼 — `💼 Acme HQ`  *(team — members: 👤 You, Sarah, Dev, Maya)*
**Pinned section (top + sidebar):**
1. 📁 Engineering (blue)
2. 🌐 Q3 roadmap — *linear.app* · `#this-week` · 👤 Sarah
3. 📝 Weekly review — Jun 1 · 👤 You

**Main list (exact order):**
1. 📁 Marketing (rose)
2. 📁 Hiring (violet)
3. 🐙 acme/web — PR #482 streaming chat — *github.com* · `#eng` · 👤 Dev
4. 🌐   — *figma.com* · `#design` · 👤 Maya
5. 🌐 Usage-based billing — *docs.stripe.com* · `#billing` · 👤 You
6. 🌐 Engineering wiki — *notion.so* · `#eng` · 👤 Dev
7. 📄 Board deck — May.pdf · `#exec` · 👤 Sarah

**Open tabs:** `Library` *(active)* · `Q3 roadmap` (Linear) · `Chat — "summarize this week's standups"`
**Tags:** `#eng` `#marketing` `#this-week` `#exec`

---

## 3. Travel ✈️ — `✈️ Japan 2026`  *(team — members: 👤 You, Alex, Jordan)*
**Pinned section (top + sidebar):**
1. 📁 Tokyo (sky)
2. 📝 14-day itinerary · 👤 You
3. 📄 Flights — ANA confirmation.pdf · `#booked` · 👤 You

**Main list (exact order):**
1. 📁 Food (orange)
2. 📁 Logistics (slate)
3. 🌐 Kyoto machiya — *airbnb.com* · `#to-book` · 👤 Alex
4. 🌐 Tokyo neighbourhood guide — *timeout.com* · `#tokyo` · 👤 You
5. 🌐 Ghibli Museum — tickets — *ghibli-museum.jp* · `#booked` · 👤 Jordan
6. 🌐 Best ramen in Shinjuku — *tabelog.com* · `#food` · 👤 Alex
7. ▶️ Kyoto walking tour in 4K — *youtube.com* · `#kyoto` · 👤 You

**Open tabs:** `Library` *(active)* · `14-day itinerary` · `Chat — "best ryokan near Kyoto?"`
**Tags:** `#tokyo` `#kyoto` `#food` `#booked` `#to-book`

---

## 4. Bookmarking 🔖 — `🔖 My web`  *(solo — all 👤 you)*
**Pinned section (top + sidebar):**
1. 📁 Read later (zinc)
2. 🌐 How to do great work — *paulgraham.com* · `#read-later`
3. ▶️ How to take smart notes — *youtube.com* · `#productivity`

**Main list (exact order):**
1. 📁 Recipes (red)
2. 📁 Wishlist (pink)
3. 🌐 The psychology of money — *collabfund.com* · `#read-later`
4. 🌐 Weeknight pasta — *cooking.nytimes.com* · `#recipes`
5. 🐙 awesome-selfhosted — *github.com* · `#dev`
6. 🌐 Best standing desk — *nytimes.com/wirecutter* · `#wishlist`
7. 🌐 r/personalfinance — prime directive — *reddit.com* · `#finance`

**Open tabs:** `Library` *(active)* · `Read later` (collection) · `Chat — "what did I save about negotiation?"`
**Tags:** `#read-later` `#recipes` `#finance` `#wishlist` `#dev`

---

## 5. Design 🎨 — `🎨 Design inspo`  *(solo — all 👤 you)*
**Pinned section (top + sidebar):**
1. 📁 Mobile UI (fuchsia)
2. 🌐 Onboarding patterns — *mobbin.com* · `#mobile`
3. 🌐 Refactoring UI — *refactoringui.com* · `#type`

**Main list (exact order):**
1. 📁 Type (neutral)
2. 📁 Color (teal)
3. 🌐 Dashboard shots — *dribbble.com* · `#mobile`
4. 🌐 Godly — web inspiration — *godly.website*
5. 🖼️ Linear settings.png · `#mobile`
6. 🌐 Type Scale — *typescale.com* · `#type`
7. 🌐 Coolors palette — *coolors.co* · `#color`

**Open tabs:** `Library` *(active)* · `Mobile UI` (collection) · `Chat — "show my saved onboarding flows"`
**Tags:** `#mobile` `#type` `#color` `#saved`

---

## 6. Learning 🇪🇸 — `🇪🇸 Learning Spanish`  *(solo — all 👤 you)*
**Pinned section (top + sidebar):**
1. 📁 Grammar (blue)
2. 🌐 SpanishDict — verb conjugator — *spanishdict.com* · `#grammar`
3. 📝 Subjunctive — when to use it

**Main list (exact order):**
1. 📁 Vocabulary (green)
2. 📁 Listening (amber)
3. ▶️ Dreaming Spanish — comprehensible input — *youtube.com* · `#listening`
4. 🌐 Duolingo — daily lessons — *duolingo.com* · `#beginner`
5. 🎧 Coffee Break Spanish — Ep. 42 — *coffeebreaklanguages.com* · `#listening`
6. 📄 Verb conjugation cheatsheet.pdf · `#reference`
7. 🌐 Language Transfer — complete course — *languagetransfer.org* · `#grammar`
8. 📝 Vocab — food & travel

**Open tabs:** `Library` *(active)* · `Subjunctive — when to use it` · `Chat — "explain ser vs estar from my notes"`
**Tags:** `#grammar` `#vocab` `#listening` `#reference` `#beginner`

---

## Feature-section shots (separate from the hero)

Show features in their own sections, each a focused view — reuse the same workspaces:

- **Semantic search** → `/search`. Research: *"does NMN actually work?"* → ranked results + snippets.
- **AI chat + MCP** → `/chat`. Short thread with an inline **citation badge** + a visible **tool call** ("Searching library…"); Work persona is good for an MCP action step.
- **Smart connections** → a **resource detail** → its **Related** section (Research → *Hallmarks of Aging* showing *Rapamycin review*, *NMN evidence*). Needs AI/Pro enabled.
- **Collaboration (deeper)** → a **resource detail** with the **comments panel** open: 2–3 messages + avatars + an **@mention** (Work → *Q3 roadmap*: `@Sarah confirm the pricing test?`), header **creator badge**, **"Synced from Linear"** badge.

---

## Capture checklist (every persona)
- Light mode; workspace emoji/name in the sidebar; clean avatars; scrub personal info.
- **Same crop / zoom / sidebar width for all six.**
- Pinned section expanded (≤ 5 items) at top, then the main list in the exact order above; let og-images/favicons load; optional shimmer upload row.
- **Team tabs (Work, Travel):** per-row **uploader avatars** show a *mix* of members. **Solo tabs:** every row shows *your* avatar.
- Export @2x, trim OS chrome → `apps/web/public/hero/<id>.png` (`research`, `work`, `travel`, `bookmarking`, `design`, `learning`).

## Next step
Once the PNGs exist I'll wire `HeroFrame` to crossfade to `apps/web/public/hero/<id>.png` per active tab, with a fallback to the live mock for any not-yet-captured persona.
