'use strict';
(async () => {
  const KEY = 'nukrimegi-site-config-v1';
  const DEFAULT = {
    version: 1,
    opening: { enabled: true, label: 'თქვენ რჩეულ\nსტუმრებს შორის\nხართ', aria: 'თქვენ რჩეულ სტუმრებს შორის ხართ — მოსაწვევის გახსნა' },
    hero: { invitation: 'გეპატიჟებით ჩვენი\nსიყვარულის დღეს', firstName: 'ნუკრი', secondName: 'მეგი', weekday: 'ხუთშაბათი', day: '15', month: 'ოქტომბერი', year: '2026', isoDate: '2026-10-15' },
    story: { dedication: 'თქვენთვის, სიყვარულით', title: 'ერთად იწყება\nჩვენი ახალი ამბავი', body: 'ჩვენი ბედნიერება კიდევ უფრო დიდი იქნება,\nთუ ამ განსაკუთრებულ დღეს ჩვენთან ერთად გაატარებთ.', signature: 'სიყვარულით, ნუკრი & მეგი' },
    countdown: { title: 'ჩვენს დღემდე', label: 'ქორწილამდე დარჩენილი დრო' },
    program: { title: 'ჩვენი დღის ამბავი' },
    events: [
      { time: '14:00', title: 'ჯვრისწერა', venue: 'მეფე თამარის ტაძარი', map: 'https://maps.app.goo.gl/852rJtv9zc7Wk15cA' },
      { time: '17:00', title: 'ხელის მოწერის\nცერემონია', venue: 'გონიოს ციხე', map: 'https://www.google.com/maps/search/?api=1&query=Gonio%20Fortress%20Georgia' },
      { time: '18:00', title: 'ქორწილი', venue: 'რესტორანი გრინ ჰაუსი', map: 'https://maps.app.goo.gl/jbrcrqgw7hZk2UHKA' }
    ],
    calendar: { title: 'ოქტომბერი', year: '2026', button: 'თარიღის შენახვა' },
    finale: { firstName: 'ნუკრი', secondName: 'მეგი', hint: 'გაასრიალეთ მარცხნივ ან მარჯვნივ' },
    rsvp: { title: 'იქნებით ჩვენთან?', intro: 'გვითხარით, ვინ გაგვიზიარებს ამ დღეს.\nშეგიძლიათ ოჯახის წევრებიც დაამატოთ.', addGuest: 'ოჯახის წევრის დამატება', submit: 'პასუხის გაგზავნა', privacy: 'თქვენს პასუხს მხოლოდ ორგანიზატორები ნახავენ.', successTitle: 'მადლობა პასუხისთვის', successNote: 'თქვენი პასუხი შენახულია.', organizerEmail: 'nukri@example.com' },
    theme: { accent: '#7b9a72', paper: '#faf7ef', ink: '#354336' },
    layout: { offsets: {} },
    customText: []
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  function merge(base, saved) {
    if (Array.isArray(base)) return Array.isArray(saved) ? saved : clone(base);
    if (base && typeof base === 'object') { const result = {}; Object.keys(base).forEach(key => { result[key] = merge(base[key], saved?.[key]); }); if (saved && typeof saved === 'object') Object.keys(saved).forEach(key => { if (!(key in result)) result[key] = saved[key]; }); return result; }
    return saved ?? base;
  }
  function load() { try { return merge(DEFAULT, JSON.parse(localStorage.getItem(KEY) || 'null')); } catch { return clone(DEFAULT); } }
  let published = clone(DEFAULT), revision = null, available = false;
  try { const response = await fetch('/api/site-content',{cache:'no-store'}); if(!response.ok) throw new Error(); const data=await response.json();published=merge(DEFAULT,data.config);revision=data.revision;available=true; } catch {}
  let saved; try { saved=JSON.parse(localStorage.getItem(KEY)||'null'); } catch {}
  let state = saved ? merge(published,saved) : clone(published), saveTimer;
  const loginScreen = $('#login-screen'), app = $('#admin-app'), preview = $('#preview'), status = $('#save-status'), previewFallback = $('#preview-fallback');
  if (location.protocol === 'https:' && preview && previewFallback) { preview.hidden = true; previewFallback.hidden = false; }
  function getPath(path) { return path.split('.').reduce((value, key) => value?.[key], state); }
  function setPath(path, value) { const parts = path.split('.'); let cursor = state; parts.slice(0, -1).forEach(key => { cursor[key] ??= {}; cursor = cursor[key]; }); cursor[parts.at(-1)] = value; }
  function stamp(message = 'ცვლილებები შენახულია ამ ბრაუზერში.') { status.textContent = `${message} ${new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}`; status.classList.add('is-saved'); }
  function saveDraft(message = true) { localStorage.setItem(KEY, JSON.stringify(state)); if (message) stamp(); clearTimeout(saveTimer); saveTimer = setTimeout(() => { preview.src = `./index.html?preview=${Date.now()}#preview`; }, 320); }
  function bindFields() {
    $$('[data-path]').forEach(field => {
      const value = getPath(field.dataset.path); if (field.type === 'checkbox') field.checked = Boolean(value); else field.value = value ?? '';
      if (field.dataset.bound === 'true') return;
      field.dataset.bound = 'true';
      field.addEventListener('input', () => { setPath(field.dataset.path, field.type === 'checkbox' ? field.checked : field.value); saveDraft(); });
      field.addEventListener('change', () => { setPath(field.dataset.path, field.type === 'checkbox' ? field.checked : field.value); saveDraft(); });
    });
  }
  function renderEvents() {
    const list = $('#events-editor'); list.textContent = '';
    state.events.forEach((event, index) => {
      const row = $('#event-template').content.firstElementChild.cloneNode(true); $('.item-number', row).textContent = `ღონისძიება ${index + 1}`;
      $('.event-time', row).value = event.time || ''; $('.event-title', row).value = event.title || ''; $('.event-venue', row).value = event.venue || ''; $('.event-map', row).value = event.map || '';
      [['.event-time', 'time'], ['.event-title', 'title'], ['.event-venue', 'venue'], ['.event-map', 'map']].forEach(([selector, key]) => $('.' + selector.slice(1), row).addEventListener('input', e => { state.events[index][key] = e.target.value; saveDraft(); }));
      $('.remove-event', row).addEventListener('click', () => { state.events.splice(index, 1); renderEvents(); saveDraft(); });
      list.append(row);
    });
  }
  const offsets = [
    ['invitation', 'მოსაწვევის წინადადება', 'hero'], ['names', 'სახელები', 'მთავარი სათაური'], ['date', 'თარიღის ბლოკი', 'დღე და თვე'], ['year', 'წელი', 'წლის ტექსტი'], ['welcome', 'მისალმება', 'შესავალი სექცია'], ['program', 'პროგრამის სათაური', 'დღის პროგრამა'], ['rsvp', 'RSVP სათაური', 'დასწრების დადასტურება']
  ];
  function renderOffsets() {
    const list = $('#offset-editor'); list.textContent = '';
    offsets.forEach(([key, label, help]) => {
      const row = $('#offset-template').content.firstElementChild.cloneNode(true), value = state.layout.offsets[key] || { x: 0, y: 0, scale: 1, size: 0 };
      $('.offset-label', row).textContent = label; $('.offset-help', row).textContent = help; $('.offset-x', row).value = value.x || 0; $('.offset-y', row).value = value.y || 0; $('.offset-scale', row).value = value.scale || 1; $('.offset-size', row).value = value.size || 0;
      [['offset-x', 'x'], ['offset-y', 'y'], ['offset-scale', 'scale'], ['offset-size', 'size']].forEach(([className, prop]) => $('.' + className, row).addEventListener('input', event => { state.layout.offsets[key] ??= { x: 0, y: 0, scale: 1, size: 0 }; state.layout.offsets[key][prop] = Number(event.target.value) || 0; if (prop === 'scale' && !event.target.value) state.layout.offsets[key][prop] = 1; saveDraft(); }));
      list.append(row);
    });
  }
  function renderCustomText() {
    const list = $('#custom-text-editor'); list.textContent = '';
    state.customText.forEach((item, index) => {
      const row = $('#custom-template').content.firstElementChild.cloneNode(true); $('.custom-value', row).value = item.text || ''; $('.custom-x', row).value = item.x ?? 50; $('.custom-y', row).value = item.y ?? 50; $('.custom-size', row).value = item.size ?? 18; $('.custom-rotate', row).value = item.rotate ?? 0; $('.custom-color', row).value = item.color || '#354336';
      [['custom-value', 'text'], ['custom-x', 'x'], ['custom-y', 'y'], ['custom-size', 'size'], ['custom-rotate', 'rotate'], ['custom-color', 'color']].forEach(([className, prop]) => $('.' + className, row).addEventListener('input', event => { state.customText[index][prop] = ['text', 'color'].includes(prop) ? event.target.value : Number(event.target.value) || 0; saveDraft(); }));
      $('.remove-custom', row).addEventListener('click', () => { state.customText.splice(index, 1); renderCustomText(); saveDraft(); }); list.append(row);
    });
  }
  function renderAll() { bindFields(); renderEvents(); renderOffsets(); renderCustomText(); }
  function showApp() { if (loginScreen) loginScreen.hidden = true; app.hidden = false; renderAll(); }
  $$('.nav-item').forEach(button => button.addEventListener('click', () => { $$('.nav-item').forEach(item => item.classList.toggle('is-active', item === button)); $$('.editor-section').forEach(section => { section.hidden = section.dataset.sectionPanel !== button.dataset.section; section.classList.toggle('is-active', !section.hidden); }); }));
  $('#save').addEventListener('click', () => { saveDraft(); stamp('შენახულია მხოლოდ ამ ბრაუზერში — საიტზე ჯერ არ გამოქვეყნებულა.'); });
  $('#add-event').addEventListener('click', () => { state.events.push({ time: '', title: '', venue: '', map: '' }); renderEvents(); saveDraft(); });
  $('#add-custom-text').addEventListener('click', () => { state.customText.push({ text: 'ახალი ტექსტი', x: 50, y: 300, size: 18, color: '#354336', rotate: 0, z: 3 }); renderCustomText(); saveDraft(); });
  $('#export').addEventListener('click', () => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `nukrimegi-invitation-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href); stamp('კონფიგურაცია ჩამოიტვირთა.'); });
  $('#import').addEventListener('change', async event => { const file = event.target.files?.[0]; if (!file) return; try { state = merge(DEFAULT, JSON.parse(await file.text())); saveDraft(); renderAll(); stamp('კონფიგურაცია ჩაიტვირთა.'); } catch { status.textContent = 'ფაილი ვერ წავიკითხე. გამოიყენეთ Export-ით მიღებული JSON.'; } event.target.value = ''; });
  $('#reset').addEventListener('click', () => { if (!window.confirm('დავაბრუნო ყველა ტექსტი და განლაგება საწყისზე?')) return; state = clone(DEFAULT); saveDraft(); renderAll(); stamp('საწყისი კონფიგურაცია აღდგა.'); });
  $('#share-rsvp').addEventListener('click', () => { const email = state.rsvp.organizerEmail || 'nukri@example.com'; const subject = 'ნუკრი & მეგი — RSVP და მოსაწვევის მართვა'; const body = `გამარჯობა ნუკრი,\n\nაქ არის მოსაწვევი და RSVP-ის მართვის პანელი:\nhttps://nukrimegi.vercel.app/admin\n\nRSVP-ის გვერდი: https://nukrimegi.vercel.app/#rsvp\n\nცვლილებები პანელში შეგიძლია Export / Import-ით გადაიტანო.`; window.location.href = `mailto:${encodeURIComponent(email)}?${new URLSearchParams({ subject, body }).toString()}`; });
  document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveDraft(); stamp(); } });
  const publishButton = $('#publish');
  publishButton.disabled = !available;
  if(!available) status.textContent='გამოქვეყნების სერვისი მიუწვდომელია. განაახლეთ გვერდი.';
  $('#publish-form').addEventListener('submit', async event => {
    event.preventDefault();
    const key=$('#publish-key').value.trim();
    if(!key) { $('#publish-key').focus(); return; }
    publishButton.disabled=true;
    const snapshot=clone(state);
    status.textContent='მიმდინარეობს გამოქვეყნება…';
    try {
      const response=await fetch('/api/site-content',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({config:snapshot,revision})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error || 'გამოქვეყნება ვერ მოხერხდა.');
      revision=data.revision;published=snapshot;$('#publish-key').value='';
      stamp('გამოქვეყნებულია — ცვლილებები ყველა სტუმრისთვის ჩანს.');
    } catch(error) { status.textContent=error.message; }
    finally { publishButton.disabled=false; }
  });
  showApp();
})();
