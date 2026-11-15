/* Firebase Authentication e Firestore; os dados do app não são persistidos no navegador. */
const firebaseConfig={apiKey:'AIzaSyBzv5h7zBfp538gM2Akougpph4knNlmcEQ',authDomain:'nutrivida-c8d05.firebaseapp.com',projectId:'nutrivida-c8d05',storageBucket:'nutrivida-c8d05.firebasestorage.app',messagingSenderId:'325586904932',appId:'1:325586904932:web:3563324bcf09174eccfc71'};
const firebaseSdk='https://www.gstatic.com/firebasejs/11.10.0/';
let auth=null,firestore=null,currentUser=null,authSdk=null,dbSdk=null,pendingGoogleCredential=null,unsubscribeStores=[];
let resolveReady,resolveAuth;const authReady=new Promise(resolve=>resolveAuth=resolve);window.NVCloudReady=new Promise(resolve=>resolveReady=resolve);
const notify=(type,detail)=>window.dispatchEvent(new CustomEvent(type,{detail}));
function publicError(error){const code=String(error?.code||'').replace(/^auth\//,'').replace(/^firestore\//,'');const messages={
 'email-already-in-use':'Este e-mail já tem uma conta. Entre em vez de criar outra.',
 'invalid-email':'O endereço de e-mail não parece válido.',
 'invalid-credential':'E-mail ou senha incorretos.',
 'user-not-found':'Não foi encontrada uma conta com esse e-mail.',
 'wrong-password':'E-mail ou senha incorretos.',
 'weak-password':'A senha é fraca. Use pelo menos 6 caracteres.',
 'too-many-requests':'Muitas tentativas. Aguarde um pouco e tente novamente.',
 'operation-not-allowed':'Ative os métodos de login necessários no Firebase Authentication.',
 'unauthorized-domain':'Este domínio ainda não está autorizado no Firebase Authentication.',
 'account-exists-with-different-credential':'Este e-mail já usa outro método de login. Entre com ele para vincular o Google.',
 'permission-denied':'O Firestore recusou o acesso. Confira as regras de segurança publicadas.',
 'unavailable':'O Firebase está indisponível no momento. Confira a conexão e tente novamente.',
 'resource-exhausted':'A cota ou o limite de gravação do Firestore foi atingido.',
 'failed-precondition':'O banco Firestore não está pronto ou a operação foi recusada pelas regras.'
};return messages[code]||error?.message||'Não foi possível concluir a operação com o Firebase.'}
function requireUser(){if(!auth||!currentUser)throw Error('Entre na sua conta para continuar.');return currentUser}
function safeId(id){const value=encodeURIComponent(String(id??'sem-id')).replaceAll('/','%2F');if(value.length>1400)throw Error('O identificador de um registro é grande demais para o Firestore.');return value}
const clean=value=>JSON.parse(JSON.stringify(value));
async function getStore(uid,store){const snap=await dbSdk.getDocs(dbSdk.collection(firestore,'usuarios',uid,store));return snap.docs.map(d=>({...d.data(),id:d.data().id??d.id}))}
async function commitItems(uid,store,items){
 const ready=[];for(const item of items){const value=clean(item),bytes=new TextEncoder().encode(JSON.stringify(value)).length;if(bytes>700*1024)throw Error(`Um registro de “${store}” ultrapassa o tamanho seguro do Firestore. Os dados antigos não foram apagados; exporte um backup e reduza esse registro antes de tentar novamente.`);ready.push({id:safeId(value.id),value})}
 for(let i=0;i<ready.length;i+=200){const batch=dbSdk.writeBatch(firestore);for(const item of ready.slice(i,i+200))batch.set(dbSdk.doc(firestore,'usuarios',uid,store,item.id),item.value);await batch.commit()}
}
async function getOldCloudBackup(uid,stores){
 const snap=await dbSdk.getDocs(dbSdk.collection(firestore,'usuarios',uid,'backups'));
 const latest=snap.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.complete===true).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0))[0];if(!latest)return null;
 const payload={};for(const store of stores){const docs=await dbSdk.getDocs(dbSdk.collection(firestore,'usuarios',uid,'backups',latest.id,'stores',store,'items'));payload[store]=docs.docs.map(d=>d.data().value||d.data()).filter(Boolean)}return payload;
}
async function connectUser(user,legacy){
 for(const stop of unsubscribeStores)try{stop()}catch(_){}unsubscribeStores=[];
 const uid=user.uid,stores=window.NVDB.stores,live={};await Promise.all(stores.map(async s=>live[s]=await getStore(uid,s)));
 const liveCount=stores.reduce((n,s)=>n+live[s].length,0);let base=live,usingBackup=false;
 if(!liveCount){const oldCloud=await getOldCloudBackup(uid,stores);if(oldCloud){base=Object.fromEntries(stores.map(s=>[s,oldCloud[s]||[]]));usingBackup=true}}
 const payload={},toWrite={};
 for(const store of stores){const merged=new Map();for(const item of base[store]||[])if(item?.id!=null)merged.set(String(item.id),clean(item));const localWrites=new Map();for(const item of legacy?.data?.[store]||[]){if(item?.id==null)continue;const id=String(item.id);if(!merged.has(id)||usingBackup){const value=clean(item);merged.set(id,value);localWrites.set(id,value)}}payload[store]=[...merged.values()];if(usingBackup)toWrite[store]=payload[store];else if(localWrites.size)toWrite[store]=[...localWrites.values()]}
 for(const [store,items] of Object.entries(toWrite))if(items.length)await commitItems(uid,store,items);
 // The old IndexedDB is cleared by NVDB only after this cloud migration succeeds.
 await Promise.all(stores.map(async store=>{const ref=dbSdk.collection(firestore,'usuarios',uid,store);let first=true;const stop=dbSdk.onSnapshot(ref,snapshot=>{const items=snapshot.docs.map(d=>({...d.data(),id:d.data().id??d.id}));if(first){first=false;window.NVDB.setRemoteStore(store,items)}else window.NVDB.setRemoteStore(store,items)},error=>notify('nv-cloud-error',{error,errorMessage:publicError(error)}));unsubscribeStores.push(stop)}));
 return payload;
}
async function initialize(){
 try{
  const [appModule,authModule,firestoreModule]=await Promise.all([import(firebaseSdk+'firebase-app.js'),import(firebaseSdk+'firebase-auth.js'),import(firebaseSdk+'firebase-firestore.js')]);
  authSdk=authModule;dbSdk=firestoreModule;const app=appModule.initializeApp(firebaseConfig);auth=authModule.initializeAuth(app,{persistence:authModule.browserLocalPersistence,popupRedirectResolver:authModule.browserPopupRedirectResolver});
  firestore=firestoreModule.initializeFirestore(app,{localCache:firestoreModule.memoryLocalCache()});
  window.NVCloud={available:true,errorMessage:publicError,currentUser:()=>currentUser,waitForAuth:()=>authReady,
   createAccount(email,password){return authModule.createUserWithEmailAndPassword(auth,email.trim(),password)},
   signIn(email,password){return authModule.signInWithEmailAndPassword(auth,email.trim(),password)},
   resetPassword(email){return authModule.sendPasswordResetEmail(auth,email.trim())},
   async signInGoogle(){const provider=new authModule.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});try{return await authModule.signInWithPopup(auth,provider)}catch(error){if(error?.code==='auth/account-exists-with-different-credential'){pendingGoogleCredential=authModule.GoogleAuthProvider.credentialFromError(error);const linkError=new Error('Este e-mail já tem uma conta com senha. Informe a senha dessa conta para vincular o acesso do Google.');linkError.code='auth/google-link-required';linkError.customData=error.customData;throw linkError}throw error}},
   async completeGoogleLink(email,password){if(!pendingGoogleCredential)throw Error('A tentativa de vínculo expirou. Toque em Entrar com Google novamente.');const result=await authModule.signInWithEmailAndPassword(auth,email.trim(),password);await authModule.linkWithCredential(result.user,pendingGoogleCredential);pendingGoogleCredential=null;return result},
   signOut(){return authModule.signOut(auth)},connectUser,disconnectUser(){for(const stop of unsubscribeStores)try{stop()}catch(_){}unsubscribeStores=[]},
   async putItem(store,item){const user=requireUser();await firestoreModule.setDoc(firestoreModule.doc(firestore,'usuarios',user.uid,store,safeId(item.id)),clean(item))},
   async putItems(store,items){const user=requireUser();await commitItems(user.uid,store,items)},
   async removeItem(store,id){const user=requireUser();await firestoreModule.deleteDoc(firestoreModule.doc(firestore,'usuarios',user.uid,store,safeId(id)))},
   async clearUserData(){const user=requireUser();const deleteCollection=async ref=>{const snap=await firestoreModule.getDocs(ref);for(let i=0;i<snap.docs.length;i+=400){const batch=firestoreModule.writeBatch(firestore);snap.docs.slice(i,i+400).forEach(d=>batch.delete(d.ref));await batch.commit()}};for(const store of window.NVDB.stores)await deleteCollection(firestoreModule.collection(firestore,'usuarios',user.uid,store));const backups=await firestoreModule.getDocs(firestoreModule.collection(firestore,'usuarios',user.uid,'backups'));for(const backup of backups.docs){const groups=await firestoreModule.getDocs(firestoreModule.collection(firestore,'usuarios',user.uid,'backups',backup.id,'stores'));for(const group of groups.docs)await deleteCollection(firestoreModule.collection(firestore,'usuarios',user.uid,'backups',backup.id,'stores',group.id,'items'));await deleteCollection(firestoreModule.collection(firestore,'usuarios',user.uid,'backups',backup.id,'stores'));await firestoreModule.deleteDoc(backup.ref)}},
   async replaceAll(payload){const user=requireUser();await this.clearUserData();for(const store of window.NVDB.stores){const items=Array.isArray(payload[store])?payload[store]:[];if(items.length)await commitItems(user.uid,store,items)}}
  };
  authModule.onAuthStateChanged(auth,user=>{currentUser=user||null;resolveAuth(currentUser);notify('nv-auth-changed',{user:currentUser})});
  resolveReady(window.NVCloud);notify('nv-cloud-ready',window.NVCloud);
 }catch(error){
  const result={available:false,errorMessage:publicError,error};window.NVCloud=result;resolveReady(result);resolveAuth(null);notify('nv-cloud-ready',result);
 }
}
initialize();
