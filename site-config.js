'use strict';
window.NM_CONFIG_READY = (async () => {
  const openingButton = document.querySelector('#enter-garden');
  if (openingButton) openingButton.disabled = true;
  const KEY = 'nukrimegi-site-config-v1';
  const base = {
  "version": 1,
  "opening": {
    "enabled": true,
    "label": "დიდი სიხარულით გიწვევთ ჩვენი   ბედნიერების საზეიმო საღამოზე",
    "aria": "დიდი სიხარულით გიწვევთ ჩვენი   ბედნიერების საზეიმო საღამოზე— მოსაწვევის გახსნა"
  },
  "hero": {
    "invitation": "",
    "firstName": "ნუკრი",
    "secondName": "მეგი",
    "weekday": "",
    "day": "",
    "month": "",
    "year": "",
    "isoDate": "2026-10-15"
  },
  "story": {
    "dedication": "",
    "title": "გვინდა თქვენი მობრძანებით კიდევ უფრო სასიამოვნო და დაუვიწყარი გავხადოთ ეს განსაკუთრებული დღე",
    "body": "",
    "signature": ""
  },
  "countdown": {
    "title": "15 ოქტომბერი 2026",
    "label": ""
  },
  "program": {
    "title": ""
  },
  "events": [
    {
      "time": "18:00",
      "title": "რესტორანი გრინ ჰაუსი",
      "venue": "",
      "map": "https://maps.app.goo.gl/BRqukrnV2iHShZTJ7?g_st=ic"
    }
  ],
  "calendar": {
    "title": "ოქტომბერი",
    "year": "2026",
    "button": ""
  },
  "finale": {
    "firstName": "ნუკრი",
    "secondName": "მეგი",
    "hint": ""
  },
  "rsvp": {
    "title": "დაგვიდასტურეთ მობრძანება",
    "intro": "გთხოვთ დაგვიდასტუროთ დასწრება 5 ოქტომბრამდე",
    "addGuest": "ოჯახის წევრის დამატება",
    "submit": "პასუხის გაგზავნა",
    "privacy": "თქვენს პასუხს მხოლოდ ორგანიზატორები ნახავენ.",
    "successTitle": "მადლობა პასუხისთვის",
    "successNote": "თქვენი პასუხი შენახულია.",
    "organizerEmail": "nukri.kobaladze.77@gmail.com"
  },
  "theme": {
    "accent": "#7b9a72",
    "paper": "#faf7ef",
    "ink": "#354336"
  },
  "layout": {
    "offsets": {}
  },
  "customText": []
};
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function merge(baseValue, savedValue) {
    if (Array.isArray(baseValue)) return Array.isArray(savedValue) ? savedValue : clone(baseValue);
    if (baseValue && typeof baseValue === 'object') {
      const result = {};
      Object.keys(baseValue).forEach(key => { result[key] = merge(baseValue[key], savedValue?.[key]); });
      if (savedValue && typeof savedValue === 'object') Object.keys(savedValue).forEach(key => { if (!(key in result)) result[key] = savedValue[key]; });
      return result;
    }
    return savedValue ?? baseValue;
  }
  let published = base;
  try {
    const response = await fetch('/api/site-content', {cache:'no-store',signal:AbortSignal.timeout(5000)});
    if (response.ok) published = merge(base, (await response.json()).config);
  } catch {}
  const isPreview = new URLSearchParams(location.search).has('preview') || location.hash === '#preview';
  const config = isPreview ? merge(published, (() => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } })()) : published;
  window.NM_DEFAULT_CONFIG = clone(base);
  window.NM_CONFIG = config;

  // Optional editor fields are created only when they contain published text.
  const optionalFields = [{"key":"hero.invitation","selector":".invitation-line","parent":".hero-content","before":"#couple-title","html":"<p class=\"invitation-line\" data-intro-text=\"\"></p>"},{"key":"story.dedication","selector":".small-dedication","parent":".welcome .section-content","before":"h2","html":"<p class=\"small-dedication\"></p>"},{"key":"countdown.title","selector":"#countdown-title","parent":".countdown-face","before":".countdown-date","html":"<h2 id=\"countdown-title\"></h2>"},{"key":"program.title","selector":"#program-title","parent":".program .section-content","before":".events","html":"<h2 id=\"program-title\"></h2>"},{"key":"calendar.button","selector":".calendar-button","parent":".calendar-paper","before":null,"html":"<a class=\"calendar-button\" href=\"https://calendar.google.com/calendar/render?action=TEMPLATE\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"თარიღის შენახვა Google Calendar-ში\"></a>"},{"key":"finale.hint","selector":".finale-scroll-note","parent":".finale-stage","before":null,"html":"<div class=\"finale-scroll-note\"><p id=\"swipe-hint\"><span aria-hidden=\"true\">←</span> <span class=\"touch-hint\"></span><span class=\"mouse-hint\"></span> <span aria-hidden=\"true\">→</span></p></div>"},{"key":"story.body","parent":".welcome .section-content","html":"<p class=\"story-body\"></p>"},{"key":"story.signature","parent":".welcome .section-content","html":"<p class=\"signature\"></p>"}];
  for (const field of optionalFields) {
    const [section,key]=field.key.split('.');
    if (!String(config[section]?.[key]||'').trim()) continue;
    if (field.key==='countdown.title' && config.countdown.title===base.countdown.title) continue;
    const parent=document.querySelector(field.parent);if(!parent)continue;
    const template=document.createElement('template');template.innerHTML=field.html;
    parent.insertBefore(template.content,parent.querySelector(field.before||':not(*)'));
  }
  const html = document.documentElement;
  const setText = (selector, value, root = document) => {
    const element = root.querySelector(selector);
    if (element && value != null) element.textContent = String(value);
    return element;
  };
  const setBreakText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element && value != null) element.innerHTML = String(value).split('\n').map(line => line.replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]))).join('<br>');
    return element;
  };
  const setMeta = (selector, value) => { const el = document.querySelector(selector); if (el && value) el.setAttribute('content', value); };

  const label = config.opening.label || base.opening.label;
  setBreakText('#enter-garden span', label);
  setText('#enter-garden', '');
  const enterButton = document.querySelector('#enter-garden');
  if (enterButton) {
    enterButton.innerHTML = `<span>${label.split('\n').map(line => line.replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch])).trim()).join('<br>')}</span>`;
    enterButton.setAttribute('aria-label', config.opening.aria || base.opening.aria);
  }
  if (config.opening.enabled === false) html.dataset.nmOpeningDisabled = 'true';

  setBreakText('.invitation-line', config.hero.invitation);
  setText('.name-line:nth-of-type(1)', config.hero.firstName);
  setText('#couple-title .name-line:first-of-type', config.hero.firstName);
  setText('#couple-title .name-line:last-of-type', config.hero.secondName);
  setText('.small-dedication', config.story.dedication);
  setBreakText('.welcome .section-content h2', config.story.title);
  setBreakText('.story-body', config.story.body);
  setText('.welcome .signature', config.story.signature);
  setText('#countdown-title', config.countdown.title);
  const countdown = document.querySelector('.countdown');
  if (countdown) countdown.setAttribute('aria-label', config.countdown.label || base.countdown.label);
  setText('#program-title', config.program.title);
  const actualDate = new Date(config.hero.isoDate+'T12:00:00Z');
  const displayDay = config.hero.day || String(actualDate.getUTCDate());
  const displayMonth = config.hero.month || ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'][actualDate.getUTCMonth()];
  const displayYear = config.hero.year || String(actualDate.getUTCFullYear());
  if(config.countdown.title.trim() === [displayDay,displayMonth,displayYear].join(' ')) document.querySelector('#countdown-title')?.remove();
  setText('.countdown-date-main', `${displayDay} ${displayMonth}`);
  setText('.countdown-date-year', displayYear);
  const title = `${config.hero.firstName} & ${config.hero.secondName} — ${displayDay} ${displayMonth}, ${displayYear}`;
  document.title = title;
  setMeta('meta[name="description"]', `${config.hero.firstName} & ${config.hero.secondName} — ${displayDay} ${displayMonth}, ${displayYear}.`);
  setMeta('meta[property="og:title"]', `${config.hero.firstName} & ${config.hero.secondName} • ${displayDay} ${displayMonth}`);

  const eventList = document.querySelector('.events');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  if (eventList && Array.isArray(config.events)) {
    eventList.innerHTML = config.events.filter(event => event && (event.title || event.venue || event.time)).map((event, index) => {
      const time = escape(event.time || '');
      const title = escape(event.title || '').replace(/\n/g, '<br>');
      const venue = escape(event.venue || '');
      const map = escape(event.map || '#');
      return `<li><div class="event-time"><time datetime="${escape(config.hero.isoDate || '2026-10-15')}T${time}:00+04:00">${time}</time></div><div class="event-details">${title?`<h3>${title}</h3>`:''}${venue?`<p>${venue}</p>`:''}<a class="map-link" data-venue="custom-${index}" href="${map}" target="_blank" rel="noopener noreferrer">${/BRqukrnV2iHShZTJ7/.test(event.map||'')?'<img class="venue-art" src="/assets/green-house-watercolor.png" width="1536" height="1024" loading="lazy" decoding="async" alt="გრინ ჰაუსის აკვარელი — რუკის გახსნა">':''}<span class="map-caption">რუკაზე ნახვა <span aria-hidden="true">↗</span></span></a></div></li>`;
    }).join('');
  }
  setText('#calendar-title', config.calendar.title);
  setText('.calendar-year', config.calendar.year);
  setText('.calendar-button', config.calendar.button);
  setText('.finale-copy h2 span:first-of-type', config.finale.firstName);
  setText('.finale-copy h2 span:last-of-type', config.finale.secondName);
  setText('.touch-hint', config.finale.hint);
  setText('.mouse-hint', config.finale.hint);
  const calendarButton = document.querySelector('.calendar-button');
  if (calendarButton && /^\d{4}-\d{2}-\d{2}$/.test(config.hero.isoDate || '')) {
    try {
      const start = new Date(`${config.hero.isoDate}T00:00:00Z`), end = new Date(start.getTime() + 86400000);
      const compact = date => date.toISOString().slice(0, 10).replace(/-/g, '');
      const calendarUrl = new URL(calendarButton.href);
      calendarUrl.searchParams.set('dates', `${compact(start)}/${compact(end)}`);
      calendarUrl.searchParams.set('text', `${config.hero.firstName} & ${config.hero.secondName} — ქორწილი`);
      calendarUrl.searchParams.set('details', (config.events || []).map(event => `${event.time || ''} — ${String(event.title || '').replace(/\n/g, ' ')}, ${event.venue || ''}\n${event.map || ''}`).join('\n\n'));
      calendarButton.href = calendarUrl.toString();
    } catch {}
  }
  setText('#rsvp-title', config.rsvp.title);
  setBreakText('.rsvp-intro', config.rsvp.intro);
  const addGuest = document.querySelector('#add-guest');
  if (addGuest) addGuest.innerHTML = `<span aria-hidden="true">+</span> ${String(config.rsvp.addGuest).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]))}`;
  const submitButton = document.querySelector('#send-rsvp');
  if (submitButton) {
    const progress = submitButton.querySelector('.button-progress');
    submitButton.textContent = '';
    submitButton.append(document.createTextNode(config.rsvp.submit || base.rsvp.submit));
    if (progress) submitButton.append(progress);
  }
  setText('.privacy-note', config.rsvp.privacy);
  setText('#rsvp-success h3', config.rsvp.successTitle);
  setText('.success-note', config.rsvp.successNote);

  for (const selector of ['.invitation-line','.small-dedication','.welcome .section-content h2','.welcome .section-content > p','.welcome .signature','#countdown-title','#program-title','.event-details h3','.event-details p','.calendar-button']) {
    document.querySelectorAll(selector).forEach(el=>{if(!el.textContent.trim())el.hidden=true;});
  }
  if(!config.finale.hint.trim()) document.querySelector('.finale-scroll-note')?.remove();
  const layoutStyle = document.createElement('style');
  Object.entries(config.theme || {}).forEach(([key, value]) => { if (value) html.style.setProperty(`--nm-${key}`, value); });
  if (config.theme) layoutStyle.textContent += `:root{--nm-accent:${config.theme.accent || base.theme.accent};--nm-paper:${config.theme.paper || base.theme.paper};--nm-ink:${config.theme.ink || base.theme.ink}}body{background:var(--nm-paper);color:var(--nm-ink)}a,.map-link,.calendar-button{color:var(--nm-accent)}.submit-rsvp,.add-guest{border-color:var(--nm-accent)}`;
  const selectorMap = {
    invitation: '.invitation-line', names: '#couple-title', date: '.countdown-date-main', year: '.countdown-date-year',
    rsvp: '#rsvp-title', program: '#program-title', welcome: '.welcome h2'
  };
  Object.entries(config.layout?.offsets || {}).forEach(([key, value]) => {
    const selector = selectorMap[key];
    if (!selector || !value) return;
    const x = Number(value.x) || 0, y = Number(value.y) || 0, scale = Number(value.scale) || 1, size = Number(value.size) || 0;
    layoutStyle.textContent += `${selector}{transform:translate(${x}px,${y}px) scale(${scale}) !important;${size ? `font-size:${size}px !important;` : ''}}`;
  });
  document.head.append(layoutStyle);

  if (Array.isArray(config.customText) && config.customText.length) {
    layoutStyle.textContent += '#nm-custom-text-layer{position:absolute;inset:0;z-index:20;pointer-events:none;overflow:hidden}#nm-custom-text-layer .nm-custom-text{position:absolute;white-space:pre-wrap;max-width:90%;text-align:center;font-family:inherit;line-height:1.2;text-shadow:0 1px 10px rgba(250,247,239,.75)}';
    const layer = document.createElement('div'); layer.id = 'nm-custom-text-layer'; layer.setAttribute('aria-label', 'დამატებითი ტექსტები');
    config.customText.filter(item => item && item.text).forEach(item => {
      const text = document.createElement('div'); text.className = 'nm-custom-text'; text.textContent = item.text;
      text.style.left = `${Number(item.x) || 50}%`; text.style.top = `${Number(item.y) || 50}px`; text.style.fontSize = `${Math.max(10, Number(item.size) || 18)}px`; text.style.color = item.color || '#3b493d'; text.style.transform = `translate(-50%, -50%) rotate(${Number(item.rotate) || 0}deg)`; text.style.zIndex = String(Number(item.z) || 3);
      layer.append(text);
    });
    document.body.append(layer);
  }
})();
