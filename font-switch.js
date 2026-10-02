'use strict';
(()=>{
 const key='nm-font-choice';let choice='1';try{choice=localStorage.getItem(key)||'1';}catch{}
 const shared=new URLSearchParams(location.search).get('font');if(['1','2','3'].includes(shared))choice=shared;
 if(!['1','2','3'].includes(choice))choice='1';document.documentElement.dataset.font=choice;
 document.addEventListener('DOMContentLoaded',()=>{
  const buttons=[...document.querySelectorAll('[data-font]')].filter(el=>el.tagName==='BUTTON');
  const apply=value=>{document.documentElement.dataset.font=value;buttons.forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.font===value)));};apply(choice);
  buttons.forEach(button=>button.addEventListener('click',()=>{choice=button.dataset.font;apply(choice);try{localStorage.setItem(key,choice);}catch{}document.fonts.ready.then(()=>window.ScrollTrigger?.refresh());}));
 });
})();
