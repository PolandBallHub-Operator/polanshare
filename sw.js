const CACHE='deni-share-pwa-v3';
const APP_SHELL=['./','./index.html','./manifest.json','./sw.js','./icons/icon-192.png','./icons/icon-512.png','./replace.png','./replace-mobile.png'];
const DB='DeniShareShareTarget';
const STORE='shared';

self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('fetch',event=>{
  const req=event.request;
  const requestUrl=new URL(req.url);
  if(req.method==='POST' && (requestUrl.pathname.endsWith('/index.html') || requestUrl.pathname.endsWith('/share-target') || requestUrl.pathname.endsWith('/'))){
    event.respondWith((async()=>{
      try{
        const form=await req.formData();
        const db=await openDb();
        const tx=db.transaction(STORE,'readwrite');
        for(const value of form.getAll('files')){
          if(value instanceof File)tx.objectStore(STORE).add({name:value.name,type:value.type,blob:value,lastModified:value.lastModified});
        }
        const title=form.get('title'), text=form.get('text'), url=form.get('url');
        const combined=[title,text,url].filter(Boolean).join('\n');
        if(combined)tx.objectStore(STORE).add({name:'shared-content.txt',type:'text/plain',blob:new Blob([combined],{type:'text/plain'}),lastModified:Date.now()});
        await txDone(tx);
      }catch(error){console.error('Share Target POST failed',error);}
      return Response.redirect(new URL('./index.html?shared=1', req.url).href,303);
    })());
    return;
  }
  if(req.method==='GET')event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res})).catch(()=>caches.match('./index.html')));
});
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function txDone(tx){return new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('transaction aborted'));});}
