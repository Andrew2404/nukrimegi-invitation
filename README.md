# ნუკრი & მეგი — wedding garden

Public invitation: https://nukrimegi.vercel.app
Wedding: Thursday, 15 October 2026, Georgia time.

## Experience
A three-line playful Georgian welcome glows within a watercolor garden. Each cover flower fades in after image decoding. The invitation sentence leads the stacked names on the next screen. Scrolling and background focus stay locked through that opening reveal. The opening RSVP shortcut is temporarily hidden; the RSVP form remains available further down the page.

Border plants begin growing when their position crosses 70% of viewport height and finish near 20%, with 0.65 second scrub smoothing. The calendar flowers also grow with scrolling, behind a clear glass surface with a translucent fallback. Calendar content remains readable throughout. The countdown shows days, hours, minutes and seconds, updating once per second. Hero flowers are reflected vertically into the following section, with matching height and responsive geometry; exactly the last border layer is reflected below RSVP, with its own scroll-linked reveal.

The finale blooms before the page bottom. Mobile horizontal swipes turn the near ring at 0.38 degrees per pixel, with the far ring moving in the opposite direction. Desktop pointer movement controls rotation without dragging; 26 extra desktop flowers make 52 total. Keyboard arrows also work. Vertical touch scrolling stays native. Reduced motion removes automatic animation and smoothing. Artwork preserves its natural aspect ratio; no SVG assets are served.

## RSVP
One person can submit up to 20 family members. Each person has one full-name field and an explicit yes/no choice. Add/remove, inline validation, a session draft, and a success receipt are supported.

The Vercel function at `api/rsvp.js` validates the request and sends one household to Google Forms. Success is shown only after Google confirms saving. No Google credentials are stored in the website. Response bodies and guest names are not logged. Origin checks, bounded requests, formula-safe names, a honeypot and best-effort per-instance throttling are included. Retry deduplication exists in the function; the derived sheet also deduplicates identical household responses. This is not a general-purpose high-volume registration service.

Form editor:
https://docs.google.com/forms/d/1p6ykzlQuRA_DoY1tQu5uQowQF1zczkpN9e1r69Tzyko/edit

`სტუმრები` is the automatic per-person list with attendance totals. `Form Responses 1` stores each household submission. Keep its columns in their current order. Do not manually type into the derived list below row 6 because that blocks formula expansion. The form remains public for submissions, while the response spreadsheet and summaries remain private.

## Files and maintenance
Active front end: `index.html`, `garden.css`, `garden.js`.
Backend: `api/rsvp.js`.
The calendar button opens a pre-filled Google Calendar event for 15 October 2026, with all three event times and supplied map links. Guests confirm Save; no file download is required. The optional `wedding.ics` asset is retained for compatibility but is no longer linked from the button.
All fonts, artwork and GSAP are self-hosted. Original generated PNGs are retained locally; optimized transparent WebP files are served. Legacy envelope files are excluded from deployment.

If the date changes, update HTML, JavaScript, calendar file and sheet labels. Map links for the church and Green House are the exact links supplied and confirmed by the owner. Gonio uses a Google Maps place search.

## Verification
Checked mobile widths 320 and 390, desktop, locked scrolling during the reveal, preserved image proportions, scroll-linked border progress, stationary closing names and horizontal swipe rotation, a fully bloomed garden at the page bottom, centred schedule and form, no horizontal overflow, and error-free browser execution, family add/remove, and the corrected date. The prior release also verified missing answers, session receipt restoration, mixed attendance and live Google Sheets delivery. The RSVP endpoint is unchanged. Server tests cover validation, household limits, spreadsheet formula safety, localized Google confirmation, origin rejection and retry deduplication. The calendar keeps its original UID and increments SEQUENCE so capable clients can recognize the date correction.

Developer test submissions are clearly marked CODEX. Test rows are removed from the response sheet after verification; Google Forms may retain those marked submissions in its own response history.

Refinement: both mirrored gardens reveal from top to bottom using a scroll-linked clip, without translation or scaling. The first two side-border layers are omitted, and individual border/calendar plants emerge horizontally from their nearest edge. The final border row ends flush with its section and is the only row mirrored below it. Desktop flower rings are tighter around the names; mobile ring spacing is preserved. The calendar highlights 15 in sage green.

Final polish: upright yellow wildflowers and blue delphinium replace the upside-down stems at the top. Opening text sits lower, the RSVP shortcut is hidden, seconds are restored, and the calendar bouquet is clipped at the glass panel bottom. The larger closing instruction fades after the first horizontal swipe, deliberate desktop mouse movement, or arrow-key interaction. The direct calendar flow was verified without saving a test event.

Scroll and text motion: Lenis 1.3.26 is self-hosted and loaded only after opening, on screens over 600px with a fine pointer and hover, when reduced motion is off. Its JS and CSS total 5,674 gzip bytes; phones do not request those assets. Lenis shares GSAP's ticker, uses gentle wheel interpolation (0.14), and leaves touch scrolling native. The controller destroys its instance on mode changes and keeps native scrolling if loading fails. No framework was added.

Section headings rise 20px and fade over 0.8 seconds at the 70% viewport threshold. Supporting copy follows with 0.12 second stagger. Text reveals once, stays visible afterward, and is shown immediately for keyboard focus, already-passed sections, and reduced motion. Welcome, countdown, program, each event, calendar, RSVP and closing names are covered; flower timelines remain independent. Four controller tests cover device gating, reduced-motion cleanup, resize during loading, and failed loading. Browser checks verified desktop activation, no Lenis request on mobile reload, text reveal progress, keyboard form focus, and family member addition.
## Public deployment

This repository contains the static invitation, admin editor, RSVP function, and Vercel deployment workflow.

Configure these GitHub Actions secrets before using the workflow:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The workflow deploys only from `main` and never stores credentials in the repository.

## Publishing from admin
The admin Publish form writes validated content to a private Vercel Blob through api/site-content.js. Only the separate high-entropy publish key authorizes writes; its SHA-256 digest is stored in lib/publish-auth.json. The key itself is never committed. GET exposes invitation content only. Drafts stay in localStorage and apply only to explicit preview URLs. Writes use Blob ETags to reject stale revisions. The CI workflow creates and connects storage if needed. Tests run before deployment.

When retiring admin, first export the live API config into the static defaults and frontend, then remove the admin pages and POST handler. Keep published storage and the GET reader until that migration is verified. To revoke publishing sooner, rotate the digest or remove the POST handler.

