# WaterMate — roadmap

_Last updated: Nov 16, 2026_

WaterMate is now a web app (like Field Locator): one link, added to the phone's home
screen, published from GitHub Pages. No QR codes, no Expo, no APK. The old Expo app
is still in the parent folder, untouched, as a reference.

## Phases

| # | Phase | Status | Model / effort |
|---|-------|--------|----------------|
| 1 | **Usable core** — Today list (done / not yet), smart grouping onto watering days, rooms with shelf scenes, add from 204-species catalog, pets, hydroponics, backup | **Done** (built + tested; see "Checked" below) | — |
| 2 | **On the phone** — GitHub repo `watermate` + Pages, Add to Home Screen | **Next** — waiting on Brian to create the empty repo | any model, low |
| 3 | **Reminders** — a real notification on watering days and when something is late | Later (questions first: which free sender) | Opus 5, high |
| 4 | **The house comes alive** — one scrolling house instead of a list of rooms, pets wandering, drag things between rooms, day/night light, more juice | Later | Opus 5, medium |
| 5 | **Bring back the good extras** from the old app — rhythm learning from history, rain button for outdoor pots, pruning nudges, progress photos, care notes for custom plants | Later | Opus 5, medium |
| 6 | **Sync** between phone and laptops | Later | Opus 5, high |
| — | Paid features | Not until all of the above is settled | — |

## How it decides things (Phase 1)

- Every thing has a "next due" day. **Done** sets it to today + its interval.
  **Not yet** moves it (tomorrow / next watering day / a week) and, if pushed 2+ days,
  makes that plant's interval 1 day longer.
- **Watering days** (default Sun + Wed, change in Plan or Settings): due dates are pulled
  onto the nearest watering day, by at most ~30% of the interval, earlier on ties.
  Anything on a cycle under 5 days (cats, chickens) keeps its own beat.
- **While you're at it**: when you're already watering, things due in the next 2 days are offered too.
- **Seasons**: plants wait 1.5x longer Dec-Feb (winter-dormant cacti 3x), 0.85x Jun-Aug.
  Plant feeding only Mar-Sep. Hydroponics full refresh and pet vitamins ignore seasons.
- **Rooms** can be "resting" (nothing asks for water) or "quiet" (sprinkler does it).
- Data lives in the phone's browser storage. Settings > Save backup writes a file.

## Checked on Nov 16

- 12 logic tests pass (`node --test test/logic.test.ts`).
- Clicked through every screen in a phone-sized browser (412x883): water, not yet, undo,
  move into room, add plant/animal, room settings, plan, reset, reload keeps data. No console errors.
- **Not checked:** a real phone, Add to Home Screen, offline use — these need the published link.

## Guesses to correct

- Cats and chickens: fresh water every 2 days. Vitamins: off.
- Hydroponics: top up weekly, full refresh every 30 days.
- All 20 plants start "due today" and "not placed yet".

## For whoever builds next

- `src/logic.ts` is the whole scheduler (pure, tested). `src/seed.ts` is the starter list.
- `src/sprites/` is copied unchanged from the Expo app; `src/rnsvg.tsx` stands in for react-native-svg.
- `npm run build` writes the site to `docs/` (GitHub Pages: branch main, folder /docs).
- `python3 tools/shots.py <dir>` takes phone-size screenshots of every screen.
