'use strict';
(()=>{
 const key='nm-font-choice-typeface-v1',valid=['1','2','3','4','5'];let choice='1';try{choice=localStorage.getItem(key)||'1';}catch{}
 const shared=new URLSearchParams(location.search).get('font');if(valid.includes(shared))choice=shared;
 if(!valid.includes(choice))choice='1';document.documentElement.dataset.font=choice;
 document.addEventListener('DOMContentLoaded',()=>{
  const picker=document.querySelector('.font-switch'),buttons=[...picker.querySelectorAll('button[data-font]')];
  const apply=value=>{document.documentElement.dataset.font=value;document.querySelector('#font-choice-label').textContent=value;buttons.forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.font===value)));};apply(choice);
  buttons.forEach(button=>button.addEventListener('click',()=>{choice=button.dataset.font;apply(choice);picker.open=false;try{localStorage.setItem(key,choice);}catch{}document.fonts.ready.then(()=>{window.ScrollTrigger?.refresh();window.dispatchEvent(new Event('resize'));});}));
  document.addEventListener('pointerdown',event=>{if(!picker.contains(event.target))picker.open=false;});
  picker.addEventListener('keydown',event=>{if(event.key==='Escape'){picker.open=false;picker.querySelector('summary').focus();}});
 });
})();
