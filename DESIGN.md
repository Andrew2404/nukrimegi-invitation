# Garden direction
Preserve the approved ivory, sage and rose watercolor identity, Georgian type and natural image proportions. Mobile first; no SVG artwork.

The playful cover text is temporary until Nukri supplies final copy. The invitation sentence precedes the vertically stacked names. Growing side gardens begin at 70% viewport height and complete at 20%, with smooth scroll-linked progress. The calendar is clear frosted glass over six watercolor plants, with restrained edge light and readable dates.

Section transitions use real reflected artwork rather than opaque cuts or broad fades: the lower hero garden is mirrored at the top of the story, and the final story-border clusters are mirrored into the finale. Leave clear space around welcome copy and RSVP controls.

The finale keeps names stationary. It blooms before the bottom, uses faster mobile swipes, and follows desktop horizontal mouse position without dragging. Desktop doubles the ring flowers to 52. Keyboard and reduced-motion alternatives remain available.

Refinement: both mirrored gardens reveal from top to bottom using a scroll-linked clip, without translation or scaling. The first two side-border layers are omitted, and individual border/calendar plants emerge horizontally from their nearest edge. The final border row ends flush with its section and is the only row mirrored below it. Desktop flower rings are tighter around the names; mobile ring spacing is preserved. The calendar highlights 15 in sage green.

Final polish: upright yellow wildflowers and blue delphinium replace the upside-down stems at the top. Opening text sits lower, the RSVP shortcut is hidden, seconds are restored, and the calendar bouquet is clipped at the glass panel bottom. The larger closing instruction fades after the first horizontal swipe, deliberate desktop mouse movement, or arrow-key interaction. The direct calendar flow was verified without saving a test event.

Scroll and text motion: Lenis 1.3.26 is self-hosted and loaded only after opening, on screens over 600px with a fine pointer and hover, when reduced motion is off. Its JS and CSS total 5,674 gzip bytes; phones do not request those assets. Lenis shares GSAP's ticker, uses gentle wheel interpolation (0.14), and leaves touch scrolling native. The controller destroys its instance on mode changes and keeps native scrolling if loading fails. No framework was added.

Section headings rise 20px and fade over 0.8 seconds at the 70% viewport threshold. Supporting copy follows with 0.12 second stagger. Text reveals once, stays visible afterward, and is shown immediately for keyboard focus, already-passed sections, and reduced motion. Welcome, countdown, program, each event, calendar, RSVP and closing names are covered; flower timelines remain independent. Four controller tests cover device gating, reduced-motion cleanup, resize during loading, and failed loading. Browser checks verified desktop activation, no Lenis request on mobile reload, text reveal progress, keyboard form focus, and family member addition.
