/* Camada de dados em memória: os registros do NutriVida são lidos e gravados somente no Firestore. */
window.NVDB={name:'nutrivida-db',version:3,stores:['foods','recipes','entries','mealLogs','water','weights','measures','exercises','plans','workouts','cardio','activities','notes','photos','profile','settings'],cache:{},uid:null,ready:false,
async readLegacy(){
 const empty=Object.fromEntries(this.stores.map(s=>[s,[]]));
 if(!('indexedDB'in window))return {data:empty,exists:false};
 try{
  if(indexedDB.databases){const known=await indexedDB.databases();if(!known.some(x=>x.name===this.name))return {data:empty,exists:false}}
  const db=await new Promise((resolve,reject)=>{const r=indexedDB.open(this.name);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('O armazenamento antigo está aberto em outra aba. Feche outras abas do NutriVida e tente novamente.'))});
  const names=[...db.objectStoreNames],data={...empty};if(!names.length){db.close();await new Promise(resolve=>{const r=indexedDB.deleteDatabase(this.name);r.onsuccess=resolve;r.onerror=resolve;r.onblocked=resolve});return {data:empty,exists:false}}
  for(const store of this.stores){if(!names.includes(store))continue;data[store]=await new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
  db.close();return {data,exists:names.length>0};
 }catch(error){if(error?.name==='NotFoundError')return {data:empty,exists:false};throw error}
},
async clearLegacy(){
 if(!('indexedDB'in window))return;
 let db;
 try{db=await new Promise((resolve,reject)=>{const r=indexedDB.open(this.name);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('A cópia na nuvem foi concluída, mas o armazenamento antigo está aberto em outra aba. Feche as outras abas do NutriVida e entre novamente para apagá-lo.'))});
  const names=[...db.objectStoreNames];if(names.length)await new Promise((resolve,reject)=>{const tx=db.transaction(names,'readwrite');names.forEach(n=>tx.objectStore(n).clear());tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Não foi possível limpar os dados antigos.'))});db.close();
  await new Promise((resolve,reject)=>{const r=indexedDB.deleteDatabase(this.name);r.onsuccess=resolve;r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Feche outras abas do NutriVida e entre novamente para concluir a remoção dos dados antigos.'))});
 }catch(error){try{db?.close()}catch(_){}throw error}
},
async open(user){this.uid=user.uid;const legacy=await this.readLegacy();const payload=await window.NVCloud.connectUser(user,legacy);this.cache=Object.fromEntries(this.stores.map(s=>[s,Array.isArray(payload[s])?payload[s]:[]]));this.ready=true;if(legacy.exists)await this.clearLegacy();return this},
all(store){if(!this.ready)throw Error('Entre na sua conta para acessar os dados.');return Promise.resolve((this.cache[store]||[]).map(x=>({...x})))},
async put(store,obj){if(!this.ready)throw Error('Entre na sua conta para salvar dados.');await window.NVCloud.putItem(store,obj);const rows=this.cache[store]||[],index=rows.findIndex(x=>String(x.id)===String(obj.id));if(index<0)rows.push({...obj});else rows[index]={...obj};this.cache[store]=rows;return obj},
async bulkPut(store,items){if(!this.ready)throw Error('Entre na sua conta para salvar dados.');if(!items.length)return;await window.NVCloud.putItems(store,items);const rows=this.cache[store]||[],byId=new Map(rows.map(x=>[String(x.id),x]));for(const item of items)byId.set(String(item.id),{...item});this.cache[store]=[...byId.values()]},
async remove(store,id){if(!this.ready)throw Error('Entre na sua conta para alterar dados.');await window.NVCloud.removeItem(store,id);this.cache[store]=(this.cache[store]||[]).filter(x=>String(x.id)!==String(id))},
async clear(){if(!this.ready)throw Error('Entre na sua conta para alterar dados.');await window.NVCloud.clearUserData();this.cache=Object.fromEntries(this.stores.map(s=>[s,[]]))},
async replaceAll(payload){await this.clear();for(const s of this.stores){const rows=Array.isArray(payload[s])?payload[s]:[];if(rows.length)await this.bulkPut(s,rows)}},
setRemoteStore(store,items){const next=Array.isArray(items)?items:[],old=JSON.stringify(this.cache[store]||[]),fresh=JSON.stringify(next);if(old===fresh)return;this.cache[store]=next;window.dispatchEvent(new CustomEvent('nv-data-changed',{detail:{store}}))},
disconnect(){window.NVCloud?.disconnectUser?.();this.cache=Object.fromEntries(this.stores.map(s=>[s,[]]));this.uid=null;this.ready=false}
};
