/* Perfil, cálculos de referência e metas sugeridas. */
window.NVProfile={bmi(p){return p.height&&p.weight?NV.round(NV.num(p.weight)/(NV.num(p.height)/100)**2,1):0},tdee(p){return NV.round(NV.calcBmr(p)*(NV.activity[p.activity]||1.2))},goal(p){let e=this.tdee(p);return NV.round(e+(p.goal==='perder'?-300:p.goal==='ganhar'?250:0))},water(p){return Math.round(NV.num(p.weight)*35)}};
