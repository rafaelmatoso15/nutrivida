/* Perfil, cálculos de referência e metas sugeridas. */
window.NVProfile={
 age(birth){if(!birth)return 0;const d=new Date(birth+'T12:00:00');if(Number.isNaN(+d))return 0;const now=new Date();let age=now.getFullYear()-d.getFullYear();if(now.getMonth()<d.getMonth()||(now.getMonth()===d.getMonth()&&now.getDate()<d.getDate()))age--;return age},
 bmi(p){return p.height&&p.weight?NV.round(NV.num(p.weight)/(NV.num(p.height)/100)**2,1):0},
 tdee(p){return NV.round(NV.calcBmr(p)*(NV.activity[p.activity]||1.2))},
 goal(p){let e=this.tdee(p);return NV.round(e+(p.goal==='perder'?-300:p.goal==='ganhar'?250:0))},
 water(p){return Math.round(NV.num(p.weight)*35)},
 calculateTargets(p,paceValue){const age=this.age(p.birth);if(age<18)throw Error('O cálculo automático é destinado a adultos a partir de 18 anos.');if(age>100)throw Error('Confira a data de nascimento informada.');if(!NV.num(p.weight)||!NV.num(p.height)||!NV.activity[p.activity])throw Error('Preencha peso, altura e nível de atividade em Editar Perfil antes de calcular.');const pace=Number(paceValue);if(!Number.isFinite(pace)||pace<0)throw Error('Informe um ritmo desejado igual ou maior que zero.');if(p.goal!=='manter'&&pace<=0)throw Error('Para perder ou ganhar peso, informe um ritmo maior que zero.');const tdee=this.tdee(p),requested=pace*7700/7,limit=Math.min(tdee*.25,1000),adjustment=p.goal==='manter'?0:Math.min(requested,limit),limited=p.goal!=='manter'&&requested>limit;const calories=Math.max(0,Math.round((tdee+(p.goal==='ganhar'?adjustment:-adjustment))/10)*10);// Morton et al. (2018): 2,0 g/kg/dia para perda de peso; 1,8 g/kg/dia para manutenção ou ganho.
const proteinFactor=p.goal==='perder'?2.0:1.8;const protein=Math.round(NV.num(p.weight)*proteinFactor),fat=Math.round(calories*.30/9),carbs=Math.max(0,Math.round((calories-protein*4-fat*9)/4));return {limited,targets:{calories,protein,carbs,fat,fiber:Math.round(calories/1000*14),water:this.water(p)}}}
};
