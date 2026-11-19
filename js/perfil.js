/* Perfil, cálculos de referência e metas sugeridas. */
window.NVProfile={
 age(birth){if(!birth)return 0;const d=new Date(birth+'T12:00:00');if(Number.isNaN(+d))return 0;const now=new Date();let age=now.getFullYear()-d.getFullYear();if(now.getMonth()<d.getMonth()||(now.getMonth()===d.getMonth()&&now.getDate()<d.getDate()))age--;return age},
 bmi(p){const weight=NV.num(p.weight??p.pesoKg),height=NV.num(p.height??p.alturaCm);return weight&&height?NV.round(weight/(height/100)**2,1):0},
 tdee(p){return NV.round(NV.calcBmr(p)*(NV.activity[p.activity]||1.2))},
 goal(p){const e=this.tdee(p),goal=String(p.goal??p.objetivo??'manter').trim().toLocaleLowerCase('pt-BR');return Math.round(e*(goal==='perder'?0.8:goal==='ganhar'?1.15:1))},
 water(p){return Math.round(NV.num(p.weight??p.pesoKg)*35+NV.num(p.trainingMinutes??p.minutosTreinoDia)*10)},
 calculateTargets(p){
  const normalize=value=>String(value??'').trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const rawAge=p.idade??p.age,age=rawAge!==undefined&&rawAge!==null&&rawAge!==''?Number(rawAge):this.age(p.birth);
  const weight=NV.num(p.pesoKg??p.weight),height=NV.num(p.alturaCm??p.height),bodyFatRaw=p.percentualGordura??p.bodyFat;
  const bodyFat=bodyFatRaw===null||bodyFatRaw===undefined||bodyFatRaw===''?null:Number(bodyFatRaw);
  const sex=normalize(p.sexo??p.sex),activity=normalize(p.nivelAtividade??p.activity),goal=normalize(p.objetivo??p.goal);
  const activityFactors={sedentario:1.2,leve:1.375,moderado:1.55,alto:1.725,'muito alto':1.9};
  const goalFactors={perder:0.8,manter:1,ganhar:1.15};
  if(!Number.isFinite(age)||age<18)throw Error('O cálculo automático é destinado a adultos a partir de 18 anos.');
  if(age>100)throw Error('Confira a idade ou a data de nascimento informada.');
  if(!weight||weight<1||!height||height<1)throw Error('Preencha peso e altura em Editar Perfil antes de calcular.');
  if(sex!=='masculino'&&sex!=='feminino')throw Error('Selecione masculino ou feminino no Perfil antes de calcular.');
  if(!Object.prototype.hasOwnProperty.call(activityFactors,activity))throw Error('Preencha o nível de atividade em Editar Perfil antes de calcular.');
  if(!Object.prototype.hasOwnProperty.call(goalFactors,goal))throw Error('Selecione perder, manter ou ganhar como objetivo antes de calcular.');
  if(bodyFat!==null&&(!Number.isFinite(bodyFat)||bodyFat<0||bodyFat>100))throw Error('Informe um percentual de gordura entre 0 e 100, ou deixe o campo vazio.');
  const trainingMinutes=NV.num(p.minutosTreinoDia??p.trainingMinutes);
  if(!Number.isFinite(trainingMinutes)||trainingMinutes<0)throw Error('Os minutos de treino devem ser iguais ou maiores que zero.');
  const tmb=bodyFat!==null&&bodyFat>0?370+21.6*(weight*(1-bodyFat/100)):10*weight+6.25*height-5*age+(sex==='masculino'?5:-161);
  const get=tmb*activityFactors[activity],calories=Math.round(get*goalFactors[goal]);
  const proteinFactor=goal==='perder'?2.2:goal==='manter'?2:1.8,fatFactor=goal==='perder'?0.7:goal==='manter'?0.9:1;
  const protein=Math.round(proteinFactor*weight),fat=Math.round(fatFactor*weight),carbs=Math.max(0,Math.round((calories-(protein*4+fat*9))/4));
  const fiber=Math.round(Math.min(45,Math.max(25,(calories/1000)*14)));
  const water=Math.round(weight*35+trainingMinutes*10);
  const micronutrients={calcium:1000,iron:sex==='masculino'?8:18,magnesium:sex==='masculino'?420:320,zinc:sex==='masculino'?11:8,vitaminD:15,vitaminC:sex==='masculino'?90:75,sodium:2300,potassium:sex==='masculino'?3400:2600};
  const targets={calories:Math.round(calories),protein:Math.round(protein),carbs:Math.round(carbs),fat:Math.round(fat),fiber:Math.round(fiber),water:Math.round(water),...micronutrients};
  return {limited:false,tmb:Math.round(tmb),get:Math.round(get),targets,micronutrients};
 }
};
