/* Agregações dos relatórios: sumarização diária e totais. */
window.NVReports={days(n,end=NV.today()){const d=new Date(end+'T12:00:00');return Array.from({length:n},(_,i)=>{const x=new Date(d);x.setDate(d.getDate()-n+1+i);return x.toISOString().slice(0,10)})},sum(items,key){return items.reduce((s,x)=>s+NV.num(x[key]),0)}};
