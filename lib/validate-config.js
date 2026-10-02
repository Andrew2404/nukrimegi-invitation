'use strict';
const defaults = require('./default-config.json');
function validateConfig(input) {
  const fail = () => { throw new Error('Invalid invitation configuration'); };
  function shape(value, template) {
    if (typeof template === 'string') { if (typeof value !== 'string' || value.length > 4000) fail(); return value; }
    if (typeof template === 'boolean' || typeof template === 'number') { if (typeof value !== typeof template) fail(); return value; }
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
    return Object.fromEntries(Object.keys(template).map(k => [k, shape(value[k], template[k])]));
  }
  if (!input || input.version !== 1) fail();
  const out = {};
  for (const key of Object.keys(defaults)) if (!['events','layout','customText'].includes(key)) out[key] = shape(input[key], defaults[key]);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(out.hero.isoDate) || !Number.isFinite(Date.parse(out.hero.isoDate)) || new Date(out.hero.isoDate).toISOString().slice(0,10) !== out.hero.isoDate) fail();
  for (const color of Object.values(out.theme)) if (!/^#[\da-f]{6}$/i.test(color)) fail();
  if (!Array.isArray(input.events) || input.events.length > 20) fail();
  out.events = input.events.map(event => {
    const e = shape(event, defaults.events[0]);
    if (e.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)) fail();
    if (e.map) { let url; try { url = new URL(e.map); } catch { fail(); } if (url.protocol !== 'https:' || url.username || url.password) fail(); }
    return e;
  });
  const number = (v,min,max) => { if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) fail(); return v; };
  out.layout = {offsets:{}};
  for (const [key,v] of Object.entries(input.layout?.offsets || {})) {
    if (!['invitation','names','date','year','rsvp','program','welcome'].includes(key)) fail();
    out.layout.offsets[key] = {x:number(v.x ?? 0,-2000,2000),y:number(v.y ?? 0,-2000,2000),scale:number(v.scale ?? 1,0,10),size:number(v.size ?? 0,0,300)};
  }
  if (!Array.isArray(input.customText) || input.customText.length > 50) fail();
  out.customText = input.customText.map(v => {
    if (typeof v.text !== 'string' || v.text.length > 4000 || !/^#[\da-f]{6}$/i.test(v.color)) fail();
    return {text:v.text,color:v.color,x:number(v.x,-100,200),y:number(v.y,-2000,30000),size:number(v.size,10,300),rotate:number(v.rotate ?? 0,-360,360),z:number(v.z ?? 3,0,30)};
  });
  return out;
}
module.exports = { validateConfig };
