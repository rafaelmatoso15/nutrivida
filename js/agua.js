/* Conversão e totalização do registro hídrico. */
window.NVWater={sum(rows,day){return rows.filter(x=>x.date===day).reduce((s,x)=>s+NV.num(x.ml),0)}};
