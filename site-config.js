'use strict';
(() => {
  const KEY = 'nukrimegi-site-config-v1';
  const base = {
    version: 1,
    opening: {
      enabled: true,
      label: 'თქვენ რჩეულ\nსტუმრებს შორის\nხართ',
      aria: 'თქვენ რჩეულ სტუმრებს შორის ხართ — მოსაწვევის გახსნა'
    },
    hero: {
      invitation: 'გეპატიჟებით ჩვენი\nსიყვარულის დღეს',
      firstName: 'ნუკრი',
      secondName: 'მეგი',
      weekday: 'ხუთშაბათი',
      day: '15',
      month: 'ოქტომბერი',
      year: '2026',
      isoDate: '2026-10-15'
    },
    story: {
      dedication: 'თქვენთვის, სიყვარულით',
      title: 'ერთად იწყება\nჩვენი ახალი ამბავი',
      body: 'ჩვენი ბედნიერება კიდევ უფრო დიდი იქნება,\nთუ ამ განსაკუთრებულ დღეს ჩვენთან ერთად გაატარებთ.',
      signature: 'სიყვარულით, ნუკრი & მეგი'
    },
    countdown: { title: 'ჩვენს დღემდე', label: 'ქორწილამდე დარჩენილი დრო' },
    program: { title: 'ჩვენი დღის ამბავი' },
    events: [
      { time: '14:00', title: 'ჯვრისწერა', venue: 'მეფე თამარის ტაძარი', map: 'https://maps.app.goo.gl/852rJtv9zc7Wk15cA' },
      { time: '17:00', title: 'ხელის მოწერის\nცერემონია', venue: 'გონიოს ციხე', map: 'https://www.google.com/maps/search/?api=1&query=Gonio%20Fortress%20Georgia' },
      { time: '18:00', title: 'ქორწილი', venue: 'რესტორანი გრინ ჰაუსი', map: 'https://maps.app.goo.gl/jbrcrqgw7hZk2UHKA' }
    ],
    calendar: { title: 'ოქტომბერი', year: '2026', button: 'თარიღის შენახვა' },
    finale: { firstName: 'ნუკრი', secondName: 'მეგი', hint: 'გაასრიალეთ მარცხნივ ან მარჯვნივ' },
    rsvp: {
      title: 'იქნებით ჩვენთან?',
      intro: 'გვითხარით, ვინ გაგვიზიარებს ამ დღეს.\nშეგიძლიათ ოჯახის წევრებიც დაამატოთ.',
      addGuest: 'ოჯახის წევრის დამატება',
      submit: 'პასუხის გაგზავნა',
      privacy: 'თქვენს პასუხს მხოლოდ ორგანიზატორები ნახავენ.',
      successTitle: 'მადლობა პასუხისთვის',
      successNote: 'თქვენი პასუხი შენახულია.',
      organizerEmail: 'nukri@example.com'
    },
    theme: { accent: '#7b9a72', paper: '#faf7ef', ink: '#354336' },
    layout: {
      offsets: {}
    },
    customText: []
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
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      return merge(base, saved);
    } catch { return clone(base); }
  }
  const config = read();
  window.NM_DEFAULT_CONFIG = clone(base);
  window.NM_CONFIG = config;

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
  setText('.date-lockup span:first-child', config.hero.weekday);
  setText('.date-lockup strong', config.hero.day);
  setText('.date-lockup span:last-child', config.hero.month);
  setText('.year', config.hero.year);
  setText('.small-dedication', config.story.dedication);
  setBreakText('.welcome .section-content h2', config.story.title);
  setBreakText('.welcome .section-content > p:nth-of-type(2)', config.story.body);
  setText('.welcome .signature', config.story.signature);
  setText('#countdown-title', config.countdown.title);
  const countdown = document.querySelector('.countdown');
  if (countdown) countdown.setAttribute('aria-label', config.countdown.label || base.countdown.label);
  setText('#program-title', config.program.title);
  setText('.program .section-intro', `${config.hero.day} ${config.hero.month}, ${config.hero.year}`);
  const title = `${config.hero.firstName} & ${config.hero.secondName} — ${config.hero.day} ${config.hero.month}, ${config.hero.year}`;
  document.title = title;
  setMeta('meta[name="description"]', `${config.hero.firstName} & ${config.hero.secondName} — ${config.hero.day} ${config.hero.month}, ${config.hero.year}.`);
  setMeta('meta[property="og:title"]', `${config.hero.firstName} & ${config.hero.secondName} • ${config.hero.day} ${config.hero.month}`);

  const eventList = document.querySelector('.events');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  if (eventList && Array.isArray(config.events)) {
    eventList.innerHTML = config.events.filter(event => event && (event.title || event.venue || event.time)).map((event, index) => {
      const time = escape(event.time || '');
      const title = escape(event.title || '').replace(/\n/g, '<br>');
      const venue = escape(event.venue || '');
      const map = escape(event.map || '#');
      return `<li><div class="event-time"><time datetime="${escape(config.hero.isoDate || '2026-10-15')}T${time}:00+04:00">${time}</time></div><div class="event-details"><h3>${title}</h3><p>${venue}</p><a class="map-link" data-venue="custom-${index}" href="${map}" target="_blank" rel="noopener noreferrer">რუკაზე ნახვა <span aria-hidden="true">↗</span></a></div></li>`;
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

  const layoutStyle = document.createElement('style');
  Object.entries(config.theme || {}).forEach(([key, value]) => { if (value) html.style.setProperty(`--nm-${key}`, value); });
  if (config.theme) layoutStyle.textContent += `:root{--nm-accent:${config.theme.accent || base.theme.accent};--nm-paper:${config.theme.paper || base.theme.paper};--nm-ink:${config.theme.ink || base.theme.ink}}body{background:var(--nm-paper);color:var(--nm-ink)}a,.map-link,.calendar-button{color:var(--nm-accent)}.submit-rsvp,.add-guest{border-color:var(--nm-accent)}`;
  const selectorMap = {
    invitation: '.invitation-line', names: '#couple-title', date: '.date-lockup', year: '.year',
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
