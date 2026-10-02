'use strict';
(async () => {
  await window.NM_CONFIG_READY;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const gs = window.gsap;
  const gate = $('#garden-gate');
  const main = $('#invitation');
  const enter = $('#enter-garden');
  let opening = false;
  let intro;
  let unlockTimer;
  const ST = window.ScrollTrigger;
  if (gs && ST) gs.registerPlugin(ST);
  const desktopScroll=window.matchMedia('(min-width: 601px) and (hover: hover) and (pointer: fine)');
  let lenis, lenisModule;
  const tickScroll=time=>lenis?.raf(time*1000);
  function loadLenis(){
    if(!lenisModule)lenisModule=new Promise(resolve=>{
      const css=document.createElement('link');css.rel='stylesheet';css.href='/assets/lenis-1.3.26.css';
      const script=document.createElement('script');script.src='/assets/lenis-1.3.26.min.js';script.async=true;
      script.onload=()=>resolve(window.Lenis);script.onerror=()=>resolve(null);
      document.head.append(css,script);
    });
    return lenisModule;
  }
  async function configureScroll(){
    const eligible=()=>desktopScroll.matches&&!reduce.matches&&gs&&ST&&!document.documentElement.classList.contains('intro-locked');
    if(!eligible()){
      if(lenis){gs.ticker.remove(tickScroll);lenis.destroy();lenis=null;}
      document.documentElement.dataset.scrollEngine='native';return;
    }
    if(lenis)return;
    const Lenis=await loadLenis();
    if(!Lenis||!eligible()||lenis)return;
    lenis=new Lenis({autoRaf:false,lerp:.14,smoothWheel:true,syncTouch:false,anchors:false});
    lenis.on('scroll',ST.update);
    gs.ticker.add(tickScroll);gs.ticker.lagSmoothing(0);
    document.documentElement.dataset.scrollEngine='lenis';
  }
  desktopScroll.addEventListener('change',configureScroll);
  const textReveals=[];
  let textReady=false;
  function revealText(group,immediate=false){
    if(group.done)return;
    group.done=true;group.trigger.dataset.textReveal='shown';group.scrollTrigger?.kill();
    const finish=()=>gs.set(group.items,{clearProps:'opacity,transform'});
    if(immediate||reduce.matches){group.tween?.kill();finish();}
    else group.tween=gs.to(group.items,{opacity:1,y:0,duration:.8,stagger:.12,ease:'power2.out',onComplete:finish});
  }
  function createTextReveals(){
    if(textReady||!gs||!ST)return;textReady=true;
    const groups=[
      ['.welcome h2','.welcome h2,.welcome .small-dedication,.welcome .section-content>p:not(.small-dedication)'],
      ['.countdown-date','#countdown-title,.countdown-date,.countdown'],
      ['.events','#program-title,.program .section-intro'],
      ...$$('.events li').map(row=>[row,[$('.event-time',row),$('.event-details h3',row),$('.event-details p',row),$('.map-link',row)]]),
      ['#calendar-title','#calendar-title,.calendar-year,.calendar,.calendar-button'],
      ['#rsvp-title','#rsvp-title,.rsvp-intro,#rsvp-form'],
      ['.finale-copy h2','.finale-copy h2']
    ];
    for(const [target,content] of groups){
      const trigger=typeof target==='string'?$(target):target;
      const items=(typeof content==='string'?$$(content):content).filter(el=>el&&!el.hidden);
      if(!trigger||!items.length)continue;
      // Headings lead; supporting copy follows in a short stagger.
      if(items.includes(trigger)){items.splice(items.indexOf(trigger),1);items.unshift(trigger);}
      const group={trigger,items,done:false};textReveals.push(group);
      if(reduce.matches||trigger.getBoundingClientRect().top<=innerHeight*.7){revealText(group,true);continue;}
      gs.set(items,{opacity:0,y:20});trigger.dataset.textReveal='pending';
      group.scrollTrigger=ST.create({trigger,start:'top 70%',once:true,onEnter:()=>revealText(group)});
    }
  }
  main.addEventListener('focusin',event=>{
    for(const group of textReveals){
      if(group.items.some(item=>item===event.target||item.contains(event.target))){
        if(group.done){group.tween?.kill();gs?.set(group.items,{clearProps:'opacity,transform'});}
        else revealText(group,true);
      }
    }
  });
  let borderAnimations = [], finaleTimeline, calendarTimeline, reflectionTimeline, closingReflectionTimeline, borderHeight = 0, borderStep = 0;
  let gardenResize, layoutTimer, countdownBloomTimeline;
  const story = $('#story-garden');
  function refreshGardenLayout() {
    clearTimeout(layoutTimer);
    layoutTimer=setTimeout(()=>{buildBorders();if(ST)ST.refresh();},100);
  }
  const scrollKeys = new Set(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ']);
  const blockScroll = event => { if (document.documentElement.classList.contains('intro-locked')) event.preventDefault(); };
  const blockKeys = event => { if (scrollKeys.has(event.key) && !['BUTTON','INPUT'].includes(event.target.tagName)) blockScroll(event); };
  function lock() {
    document.documentElement.classList.add('intro-locked');
    document.body.classList.add('intro-fixed');
    main.inert = true;
    window.addEventListener('wheel',blockScroll,{passive:false});
    window.addEventListener('touchmove',blockScroll,{passive:false});
    window.addEventListener('keydown',blockKeys);
  }
  function revealAll() {
    gate.hidden = true;
    main.inert = false;
    document.documentElement.classList.remove('intro-locked');
    document.body.classList.remove('intro-fixed');
    window.removeEventListener('wheel',blockScroll);
    window.removeEventListener('touchmove',blockScroll);
    window.removeEventListener('keydown',blockKeys);
    clearTimeout(unlockTimer);
    if (gs) gs.set($$('.hero .stem,.hero .bloom img,.hero .letter,.hero h1 i,[data-intro-text]'),{clearProps:'all'});
    opening = false;
    observeGarden();
  }
  function preparePlant(plant) {
    gs.set($('.stem',plant),{opacity:0,scaleY:.18,y:14});
    gs.set($('.bloom img',plant),{opacity:0,scale:.28,rotation:-13});
  }
  function bloom(plant, timeline, start=0, duration=1) {
    timeline.to($('.stem',plant),{opacity:1,scaleY:1,y:0,duration:duration*.9,ease:'power2.out'},start)
      .to($('.bloom img',plant),{opacity:1,scale:1,rotation:0,duration:duration*1.3,ease:'power3.out'},start+duration*.32);
  }
  function buildBorders() {
    const heroHeight=$('.hero').getBoundingClientRect().height;
    $('.reflection-art').style.height=`${heroHeight}px`;
    const height=story.getBoundingClientRect().height,step=innerWidth<600?158:200;
    const venue=$('.program:has(.venue-art)'),storyTop=story.getBoundingClientRect().top;
    const venueBounds=venue?.getBoundingClientRect();
    if(Math.abs(height-borderHeight)<3&&step===borderStep)return;
    borderHeight=height;borderStep=step;
    borderAnimations.forEach(tl=>{tl.scrollTrigger?.kill();tl.kill();});borderAnimations=[];
    const kinds=['cosmos','delphinium','wildflowers','daisies','rose','wildflowers'];
    $$('.garden-border',story).forEach((border,side)=>{
      border.textContent='';
      const echoBorder=$$( '.echo-border')[side];echoBorder.textContent='';
      const slotHeight=innerWidth<600?220:260;
      const lastLayer=Math.max(2,Math.ceil((height-slotHeight+65)/step));
      // The reflected hero occupies the first two rows of the side garden.
      for(let i=2;i<=lastLayer;i++){
        const slotTop=i===lastLayer?height-slotHeight:i*step-65;
        const slot=document.createElement('span');slot.className='border-slot';slot.style.top=`${slotTop}px`;
        const kind=kinds[(i+side*2)%kinds.length];
        slot.innerHTML=`<span class="grow-art foliage" style="--lean:${(i%3-1)*13+side*7}deg"><img src="/assets/flowers/greenery.webp" width="640" height="960" alt="" loading="lazy" decoding="async"></span><span class="grow-art border-flower" style="--lean:${(side?-1:1)*(12+i%3*8)}deg"><img src="/assets/flowers/${kind}.webp" width="640" height="960" alt="" loading="lazy" decoding="async"></span>`;
        // Retain the clusters so the venue framing can be restored later.
        if(venueBounds&&slotTop+slotHeight>venueBounds.top-storyTop-24&&slotTop<venueBounds.bottom-storyTop+24)slot.dataset.venueOverlap='true';
        border.append(slot);
        let echo;
        if(i===lastLayer){
          echo=slot.cloneNode(true);echo.classList.add('echo-slot');
          echo.style.top='0px';
          echoBorder.append(echo);
        }
        if(gs&&ST&&!reduce.matches){
          growFromEdge(slot,side);
        }else slot.dataset.growth='1';
      }
    });
  }
  function growFromEdge(slot,side,trigger=slot){
    const shift=side?48:-48,origin=side?'100% 50%':'0% 50%';
    const tl=gs.timeline({scrollTrigger:{trigger,start:'top 52%',end:'top 8%',scrub:.65,invalidateOnRefresh:true},onUpdate:()=>{slot.dataset.growth=tl.progress().toFixed(3);}});
    tl.fromTo($('.foliage',slot),{opacity:0,x:shift,clipPath:side?'inset(0% 0% 0% 100%)':'inset(0% 100% 0% 0%)',scale:.86,transformOrigin:origin},{opacity:1,x:0,clipPath:'inset(0% 0% 0% 0%)',scale:1,duration:1,ease:'none'},0)
      .fromTo($('.border-flower',slot),{opacity:0,scale:.78,x:shift,transformOrigin:origin},{opacity:1,scale:1,x:0,duration:.8,ease:'power1.out'},.2);
    borderAnimations.push(tl);
  }
  function createReflection(){
    if(reflectionTimeline||!gs||!ST||reduce.matches)return;
    const reflection=$('.hero-reflection');
    // Clip the untransformed outer frame so both mirrors reveal downward.
    reflectionTimeline=gs.timeline({scrollTrigger:{trigger:reflection,start:'top 70%',end:'top 10%',scrub:.65,invalidateOnRefresh:true},onUpdate:()=>{reflection.dataset.growth=reflectionTimeline.progress().toFixed(3);}})
      .fromTo(reflection,{clipPath:'inset(0% 0% 100% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1,ease:'none'});
    const closing=$('.story-reflection');
    closingReflectionTimeline=gs.timeline({scrollTrigger:{trigger:closing,start:'top 70%',end:'top 20%',scrub:.65,invalidateOnRefresh:true},onUpdate:()=>{closing.dataset.growth=closingReflectionTimeline.progress().toFixed(3);}})
      .fromTo(closing,{clipPath:'inset(0% 0% 100% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1,ease:'none'});
  }
  function createCountdownGarden() {
    if(countdownBloomTimeline || !gs || !ST || reduce.matches)return;
    const section=$('.countdown-section');
    countdownBloomTimeline=gs.timeline({scrollTrigger:{trigger:section,start:'top 88%',end:'top 24%',scrub:.7,invalidateOnRefresh:true},onUpdate:()=>{section.dataset.bloom=countdownBloomTimeline.progress().toFixed(3);}})
      .fromTo($$('.countdown-flower img'),{opacity:0,scale:.55,y:32},{opacity:1,scale:1,y:0,duration:1,stagger:.09,ease:'power1.out'});
  }
  function createFinale() {
    if(finaleTimeline||!gs||!ST||reduce.matches)return;
    const finale=$('#finale');
    // The garden is fully grown before the closing screen reaches the page bottom.
    finaleTimeline=gs.timeline({scrollTrigger:{trigger:finale,start:'top 100%',end:'top 22%',scrub:.35,invalidateOnRefresh:true},onUpdate:()=>{finale.dataset.progress=finaleTimeline.progress().toFixed(3);}});
    finaleTimeline.fromTo($$('.orbit-bloom'),{opacity:0,scale:.12,rotation:-18},{opacity:1,scale:1,rotation:0,duration:1,stagger:{each:.025,from:'center'},ease:'power2.out'},0);
  }
  const stage=$('.finale-stage'),near=$('.orbit-near'),far=$('.orbit-far');
  let gesture=null,angle=0,hintDismissed=false;
  function dismissGardenHint(){
    if(hintDismissed)return;
    hintDismissed=true;
    const hint=$('.finale-scroll-note');if(!hint)return;
    if(gs&&!reduce.matches)gs.to(hint,{opacity:0,y:6,duration:.45,onComplete:()=>{hint.hidden=true;}});
    else hint.hidden=true;
  }
  let lastGardenScroll=scrollY, gardenScrollFrame=0;
  window.addEventListener('scroll',()=>{
    if(gardenScrollFrame)return;
    gardenScrollFrame=requestAnimationFrame(()=>{
      gardenScrollFrame=0;
      const delta=scrollY-lastGardenScroll;lastGardenScroll=scrollY;
      const bounds=stage.getBoundingClientRect();
      if(!reduce.matches && bounds.top<innerHeight*.8 && bounds.bottom>0 && Math.abs(delta)<innerHeight)turnGarden(angle+delta*.16);
    });
  },{passive:true});
  // At the page bottom, a downward wheel gesture can still play with the flowers.
  stage.addEventListener('wheel',event=>{
    if(!reduce.matches && event.deltaY>0 && scrollY+innerHeight>=document.documentElement.scrollHeight-2)turnGarden(angle+Math.min(event.deltaY,120)*.12);
  },{passive:true});
  const swipeSpeed=.38;
  function turnGarden(next){
    angle=next;
    stage.dataset.rotation=angle.toFixed(1);
    if(gs) {
      gs.to(near,{rotation:angle,duration:reduce.matches?0:.65,ease:'power2.out',overwrite:true});
      gs.to(far,{rotation:-angle*2/3,duration:reduce.matches?0:.85,ease:'power2.out',overwrite:true});
    } else {
      near.style.transform=`translate(-50%,-50%) rotate(${angle}deg)`;
      far.style.transform=`translate(-50%,-50%) rotate(${-angle*2/3}deg)`;
    }
  }
  stage.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0)return;
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,angle,horizontal:false};
  });
  stage.addEventListener('pointermove',event=>{
    if(event.pointerType==='mouse'&&innerWidth>600&&window.matchMedia('(hover: hover) and (pointer: fine)').matches){
      const bounds=stage.getBoundingClientRect();
      const next=((event.clientX-bounds.left)/bounds.width-.5)*220;
      if(Math.abs(next-angle)>4)dismissGardenHint();
      turnGarden(next);
      return;
    }
    if(!gesture||gesture.id!==event.pointerId)return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    if(!gesture.horizontal){
      if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){gesture=null;return;}
      if(Math.abs(dx)<8||Math.abs(dx)<=Math.abs(dy))return;
      gesture.horizontal=true;dismissGardenHint();stage.setPointerCapture(event.pointerId);stage.classList.add('dragging');
    }
    turnGarden(gesture.angle+dx*swipeSpeed);
  });
  function releaseGesture(event){
    if(gesture&&gesture.id===event.pointerId){
      if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
      gesture=null;
    }
    stage.classList.remove('dragging');
  }
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>stage.addEventListener(type,releaseGesture));
  stage.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
      event.preventDefault();dismissGardenHint();turnGarden(angle+(event.key==='ArrowRight'?15:-15));
    }
  });
  // Each cutout starts transparent, including on an uncached first visit.
  $$('.gate-sprig').forEach((sprig,i)=>{
    sprig.style.setProperty('--arrival-delay',`${i*.095}s`);
    const img=$('img',sprig);
    const ready=()=>sprig.classList.add('is-ready');
    img.decode().then(ready,()=>{if(img.complete)ready();else img.addEventListener('load',ready,{once:true});});
  });
  function observeGarden() {
    document.documentElement.classList.toggle('garden-motion',!!gs&&!!ST&&!reduce.matches);
    buildBorders();createFinale();createCountdownGarden();createReflection();createTextReveals();configureScroll();
    if(!calendarTimeline&&gs&&ST&&!reduce.matches){
      calendarTimeline=gs.timeline({scrollTrigger:{trigger:$('.calendar-section'),start:'top 70%',end:'top 15%',scrub:.65}})
        .fromTo($$('.calendar-flower img'),{opacity:0,scale:.85,x:i=>i%2?45:-45},{opacity:1,scale:1,x:0,duration:1,stagger:.08,ease:'power1.out'});
    }
    if(!gardenResize&&'ResizeObserver' in window){gardenResize=new ResizeObserver(refreshGardenLayout);gardenResize.observe(story);}
    if(ST){requestAnimationFrame(()=>ST.refresh());document.fonts?.ready.then(()=>ST.refresh());}
  }
  async function enterGarden() {
    if (opening) return;
    opening=true;
    enter.disabled=true;
    $('#opening-status').textContent='ჩვენი ბაღი იშლება';
    unlockTimer=setTimeout(revealAll,10000);
    if (!gs || reduce.matches) {
      if (gs) gs.to(gate,{opacity:0,duration:.3,onComplete:revealAll});
      else revealAll();
      return;
    }
    const images=$$('.hero-garden img');
    await Promise.race([Promise.allSettled(images.map(img=>img.decode())),new Promise(resolve=>setTimeout(resolve,1800))]);
    intro=gs.timeline({defaults:{ease:'power3.out'},onComplete:()=>{
      revealAll();
      $('#couple-title').setAttribute('tabindex','-1');
      $('#couple-title').focus({preventScroll:true});
      $('#opening-status').textContent='მოსაწვევი გაიხსნა';
    }});
    intro.to(enter,{opacity:0,y:-8,scale:.96,duration:.3},0)
      .to($('.gate-copy'),{opacity:0,y:-12,duration:.45},0)
      .to($('.gate-garden'),{scale:1.05,duration:1,ease:'power2.inOut'},0)
      .to(gate,{opacity:0,duration:.8,onComplete:()=>{gate.hidden=true;}},.15);
    $$('.hero-plant').forEach((plant,i)=>bloom(plant,intro,.35+(i%8)*.16+Math.floor(i/8)*.2,1.35));
    intro.fromTo($$('.hero .hero-green'),{opacity:0,y:80},{opacity:1,y:0,duration:1.6},.3);
    const names=$$('[data-letter-reveal]');
    intro.to($$('.letter',names[0]),{opacity:1,y:0,filter:'blur(0px)',duration:.4,stagger:.12},1.25)
      .to($('.hero h1 i'),{opacity:1,scale:1,duration:.65},2.05)
      .to($$('.letter',names[1]),{opacity:1,y:0,filter:'blur(0px)',duration:.4,stagger:.12},2.35)
      .to($$('.invitation-line'),{opacity:1,y:0,duration:1.1},.65)
      .to($$('[data-intro-text]:not(.invitation-line)'),{opacity:1,y:0,duration:.85,stagger:.16},3.15);
  }
  $$('.name-line').forEach(line=>{
    const text=line.textContent;
    const graphemes=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('ka',{granularity:'grapheme'}).segment(text)].map(item=>item.segment):Array.from(text);
    line.textContent='';
    graphemes.forEach(char=>{const span=document.createElement('span');span.className='letter';span.textContent=char;line.append(span);});
  });
  const openingDisabled = document.documentElement.dataset.nmOpeningDisabled === 'true';
  if (!location.hash && !openingDisabled) {
    lock();
    gate.hidden=false;
    if (gs && !reduce.matches) {
      $$('.hero-plant').forEach(preparePlant);
      gs.set($$('.hero .letter'),{opacity:0,y:8,filter:'blur(2px)'});
      gs.set($('.hero h1 i'),{opacity:0,scale:.85});
      gs.set($$('[data-intro-text]'),{opacity:0,y:10});
    }
    gate.addEventListener('click',()=>{if(!enter.disabled)enterGarden();});
    enter.disabled=false;
  } else {gate.hidden=true;observeGarden();}
  $('.skip-link').addEventListener('click',()=>{if(intro)intro.kill();revealAll();});
  reduce.addEventListener('change',()=>{
    configureScroll();
    if(reduce.matches){
      textReveals.forEach(group=>{group.done=false;revealText(group,true);});

      if(intro)intro.kill();if(opening)revealAll();
      borderAnimations.forEach(tl=>{tl.scrollTrigger?.kill();tl.kill();});borderAnimations=[];
      if(finaleTimeline){finaleTimeline.scrollTrigger?.kill();finaleTimeline.kill();finaleTimeline=null;}
      if(countdownBloomTimeline){countdownBloomTimeline.scrollTrigger?.kill();countdownBloomTimeline.kill();countdownBloomTimeline=null;}
      if(calendarTimeline){calendarTimeline.scrollTrigger?.kill();calendarTimeline.kill();calendarTimeline=null;}
      if(reflectionTimeline){reflectionTimeline.scrollTrigger?.kill();reflectionTimeline.kill();reflectionTimeline=null;}
      if(closingReflectionTimeline){closingReflectionTimeline.scrollTrigger?.kill();closingReflectionTimeline.kill();closingReflectionTimeline=null;}
      document.documentElement.classList.remove('garden-motion');
      if(gs)gs.set($$('.stem,.bloom img,.grow-art,.orbit-bloom,.orbit-ring,.finale-scroll-note,.calendar-flower img,.countdown-flower img,.hero-reflection,.story-reflection'),{clearProps:'all'});
    }else if(!document.documentElement.classList.contains('intro-locked')){borderHeight=0;observeGarden();}
    if(ST)ST.refresh();
  });
  window.addEventListener('resize',refreshGardenLayout);
  const configuredDate=window.NM_CONFIG?.hero?.isoDate||'2026-10-15';
  const weddingTime=window.NM_CONFIG?.events?.find(event=>event.time)?.time || '18:00';
  const weddingDate=new Date(`${configuredDate}T${weddingTime}:00+04:00`).getTime();
  function countdown() {
    const now=Date.now(), seconds=Math.max(0,Math.floor((weddingDate-now)/1000));
    const values={days:Math.floor(seconds/86400),hours:Math.floor(seconds%86400/3600),minutes:Math.floor(seconds%3600/60),seconds:seconds%60};
    Object.entries(values).forEach(([id,value])=>$('#'+id).textContent=String(value).padStart(2,'0'));
    if(!seconds&&$('#countdown-title')){$('#countdown-title').textContent=now<weddingDate+36000000?'ჩვენი დღე დადგა':'ჩვენი სიყვარულის დღე';}
  }
  countdown();setInterval(()=>{if(!document.hidden)countdown();},1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)countdown();});
  const calendarDate=new Date(configuredDate+'T12:00:00Z'),firstDay=new Date(Date.UTC(calendarDate.getUTCFullYear(),calendarDate.getUTCMonth(),1)),offset=(firstDay.getUTCDay()+6)%7,total=new Date(Date.UTC(calendarDate.getUTCFullYear(),calendarDate.getUTCMonth()+1,0)).getUTCDate();
  for(let index=0;index<Math.ceil((offset+total)/7)*7;index++){const span=document.createElement('span'),day=index-offset+1;if(day>0&&day<=total)span.textContent=day;if(day===calendarDate.getUTCDate())span.className='wedding-day';$('#calendar-days').append(span);}

  const form=$('#rsvp-form'), list=$('#guest-list'), add=$('#add-guest'), send=$('#send-rsvp'), success=$('#rsvp-success');
  const DRAFT='nm-rsvp-draft-v2', RECEIPT='nm-rsvp-receipt-v2';
  const storage={get(key){try{return JSON.parse(sessionStorage.getItem(key));}catch{return null;}},set(key,value){try{sessionStorage.setItem(key,JSON.stringify(value));}catch{}},remove(key){try{sessionStorage.removeItem(key);}catch{}}};
  function createId(){
    if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
    const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
    const hex=[...bytes].map(value=>value.toString(16).padStart(2,'0')).join('');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  }
  let id=createId(), counter=0, sending=false;
  function guests(){return $$('.guest',list).map(row=>({name:$('.guest-name',row).value.trim().replace(/\s+/g,' '),attendance:$('input[type=radio]:checked',row)?.value||''}));}
  function refresh(){
    const rows=$$('.guest',list);rows.forEach((row,i)=>{$('.guest-number',row).textContent=i+1;$('.remove-guest',row).hidden=rows.length===1;$('.remove-guest',row).setAttribute('aria-label',`სტუმარი ${i+1} — წაშლა`);});
    const data=guests(), yes=data.filter(g=>g.attendance==='yes').length,no=data.filter(g=>g.attendance==='no').length;
    $('#family-summary').textContent=`${data.length} სტუმარი · ${yes} მოდის · ${no} ვერ მოდის`;
    add.disabled=rows.length>=20;add.title=rows.length>=20?'ერთ ჯერზე შეგიძლიათ 20 სტუმრის დამატება':'';
    storage.set(DRAFT,{id,guests:data});
  }
  function addGuest(data={},focus=false){
    if(list.children.length>=20)return;
    const row=$('#guest-template').content.firstElementChild.cloneNode(true),key=++counter;
    const input=$('.guest-name',row);input.value=data.name||'';input.id=`guest-name-${key}`;
    const error=$('.guest-error',row);error.id=`guest-error-${key}`;input.setAttribute('aria-describedby',error.id);
    $$('input[type=radio]',row).forEach(radio=>{radio.name=`attendance-${key}`;radio.checked=radio.value===data.attendance;radio.setAttribute('aria-describedby',error.id);});
    $('.remove-guest',row).addEventListener('click',()=>{if(sending)return;const next=row.previousElementSibling||row.nextElementSibling;row.remove();refresh();if(next)$('.guest-name',next).focus();});
    row.addEventListener('input',()=>{row.classList.remove('invalid');error.hidden=true;input.removeAttribute('aria-invalid');refresh();});
    row.addEventListener('change',refresh);
    list.append(row);refresh();
    if(focus){input.focus({preventScroll:true});row.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'nearest'});if(gs&&!reduce.matches)gs.from(row,{opacity:0,y:12,duration:.35,ease:'power2.out'});}
  }
  function showSuccess(receipt,focus=false){
    form.hidden=true;success.hidden=false;
    $('#success-summary').textContent=`${receipt.yes} სტუმარი მოდის · ${receipt.no} სტუმარი ვერ მოდის`;
    if(focus){success.focus({preventScroll:true});success.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'center'});}
  }
  const saved=storage.get(DRAFT),receipt=storage.get(RECEIPT);
  if(saved&&Array.isArray(saved.guests)&&saved.guests.length&&saved.guests.length<=20){id=/^[0-9a-f-]{36}$/i.test(saved.id)?saved.id:id;saved.guests.forEach(g=>addGuest(g));}else addGuest();
  if(receipt&&Number.isInteger(receipt.yes)&&Number.isInteger(receipt.no))showSuccess(receipt);
  add.addEventListener('click',()=>addGuest({},true));
  $('#another-family').addEventListener('click',()=>{storage.remove(RECEIPT);storage.remove(DRAFT);id=createId();list.textContent='';success.hidden=true;form.hidden=false;addGuest({},true);});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(sending)return;
    const data=guests();let firstInvalid;
    $$('.guest',list).forEach((row,i)=>{
      const name=data[i].name, attendance=data[i].attendance;
      const message=name.length<2?'ჩაწერეთ სტუმრის სახელი და გვარი.':!attendance?'აირჩიეთ, დაესწრება თუ არა სტუმარი.':'';
      const error=$('.guest-error',row);error.textContent=message;error.hidden=!message;row.classList.toggle('invalid',!!message);
      if(message){$('.guest-name',row).setAttribute('aria-invalid',String(name.length<2));firstInvalid||=name.length<2?$('.guest-name',row):$('input[type=radio]',row);}
    });
    if(firstInvalid){firstInvalid.focus();return;}
    const error=$('#form-error');error.hidden=true;sending=true;send.disabled=true;add.disabled=true;
    $$('input,.remove-guest',list).forEach(el=>el.disabled=true);
    send.firstChild.textContent='პასუხი იგზავნება…';$('.button-progress',send).hidden=false;
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch('/api/rsvp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,guests:data,website:form.elements.website.value}),signal:controller.signal});
      const result=await response.json().catch(()=>({}));
      if(!response.ok||!result.ok)throw new Error(result.message||'პასუხის შენახვა ვერ დადასტურდა. გთხოვთ, სცადოთ ხელახლა.');
      storage.set(RECEIPT,result);storage.remove(DRAFT);showSuccess(result,true);
    }catch(reason){error.textContent=reason.name==='AbortError'?'პასუხის შენახვა ვერ დადასტურდა. თქვენი ჩანაწერები შენარჩუნებულია — სცადეთ ხელახლა.':reason.message||'კავშირი ვერ დამყარდა. სცადეთ ხელახლა.';error.hidden=false;}
    finally{clearTimeout(timeout);sending=false;send.disabled=false;$$('input,.remove-guest',list).forEach(el=>el.disabled=false);add.disabled=list.children.length>=20;send.firstChild.textContent='პასუხის გაგზავნა';$('.button-progress',send).hidden=true;}
  });
})();
