# Nukri & Megi — locked invitation

Production: https://nukrimegi.vercel.app

Approved content is baked into index.html. The default typography uses self-hosted GeorgianSerif display text and GeorgianSans small controls. There is no font picker, admin page, preview mode, publishing API, or runtime content fetch.

garden.css and garden.js provide the opening, countdown, flower reveals and spinning finale. Lenis loads only for eligible desktop devices; mobile uses native scrolling. Reduced motion is supported. Venue-border flowers are preserved and masked only by the illustration's alpha silhouette.

RSVP remains at api/rsvp.js and submits household answers to the existing Google Form. It uses Node built-ins and requires no npm dependencies. Client drafts and receipts stay in sessionStorage. The RSVP destination and response data were not changed when retiring the editor.

GitHub Actions runs node --test tests/*.test.cjs, builds with Vercel CLI, then deploys production from main. Required secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID. Historical editor data may remain in private storage but is no longer read or writable through the site.

To change the locked invitation, edit the static HTML/CSS/JS, run checks, and deploy through GitHub. Font licenses are kept beside the active fonts. Original source flower PNGs are excluded from deployment; optimized WebP versions are served.
