// Cache básico para abrir o aplicativo sem internet após a primeira visita.
const CACHE='nutrivida-v18';
const FILES=['./','./index.html','./manifest.json','./css/style.css','./js/db.js','./js/utils.js','./js/perfil.js','./js/alimentos.js','./js/receitas.js','./js/diario.js','./js/prato.js','./js/agua.js','./js/treinos.js','./js/cardio.js','./js/relatorios.js','./js/backup.js','./js/app.js','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./data/taco.json','./data/exercicios.json','./data/cardio.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method==='GET')e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('./index.html'))))});
