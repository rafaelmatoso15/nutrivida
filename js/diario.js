/* Helpers do diário alimentar e totalização por dia. */
window.NVDiary={meals:['Café da manhã','Almoço','Lanche','Jantar','Ceia'],totals(entries){const t=Object.fromEntries(NV.nutrients.map(k=>[k,0]));entries.forEach(e=>NV.nutrients.forEach(k=>t[k]+=NV.num(e[k])));return t}};
