# Product
<!-- impeccable:product-schema 1 -->
## Platform
web
## Purpose
Georgian wedding invitation for ნუკრი & მეგი, shared at https://nukrimegi.vercel.app. Guests reveal a growing garden, see the date and three events, save the date, and send a family RSVP.
## Confirmed details
15 October 2026, Thursday. The user corrected the previously supplied date of 25 October. Event times and venues remain unchanged.
14:00 ჯვრისწერა — მეფე თამარის ტაძარი.
17:00 ხელის მოწერის ცერემონია — გონიოს ციხე.
18:00 ქორწილი — რესტორანი გრინ ჰაუსი.
## Brand commitment
Keep the floral identity. The user explicitly replaced the envelope with one central reveal button, fluid flower growth, gradual text appearance, and small side flowers that appear during scrolling. Never stretch artwork. No SVG artwork. Mobile-first layout.

Current refinement: a richer floral opening, continuous greenery and colourful flowers along both borders, growth directly controlled by scrolling, a minimal days/hours/minutes/seconds countdown, and a single-screen ending that blooms early and lets horizontal swipes rotate flowers around vertically stacked names. The reference is https://duyvenvoorde.nl/en, using the site's own watercolor assets.
## Open details
The user supplied and confirmed exact church and Green House map pins. Google calls the reception venue Guesthouse Green House; user explicitly confirmed it is correct. RSVP needs full name and a separate yes/no answer per person, with one person able to register a family. No contact number, end time, music, or photo collection supplied.
## Implementation choice
Static HTML/CSS/JavaScript with self-hosted GSAP and fonts, plus a Vercel RSVP function. It submits one household to the owner's Google Form and private response Sheet. No Google credentials in the site. Maximum 20 guests per submission. Google Sheets derives the per-person guest list and attendance totals. Public responses are never exposed by the website.

Latest refinement: playful temporary welcome, invitation sentence above names, delayed 70%-viewport flower reveals, floral glass calendar, mirrored section joins, faster mobile swipes and desktop mouse-following flower rotation.

Final polish: upright yellow wildflowers and blue delphinium replace the upside-down stems at the top. Opening text sits lower, the RSVP shortcut is hidden, seconds are restored, and the calendar bouquet is clipped at the glass panel bottom. The larger closing instruction fades after the first horizontal swipe, deliberate desktop mouse movement, or arrow-key interaction. The direct calendar flow was verified without saving a test event.
