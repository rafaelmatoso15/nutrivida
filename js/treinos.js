/* Catálogo e cálculos auxiliares de treinos; compatível com os registros antigos. */
window.NVTraining={
groups:['Peito','Costas','Ombros','Bíceps','Tríceps','Pernas','Glúteos','Abdômen','Panturrilha','Full body'],
equipment:['Barra','Halteres','Máquina','Polia','Peso corporal','Elástico'],
setsOf(exercise){if(!exercise)return [];if(Array.isArray(exercise.sets))return exercise.sets;if(Number(exercise.reps)>0)return Array.from({length:Math.max(1,Number(exercise.sets)||1)},()=>({kg:Number(exercise.kg)||0,reps:Number(exercise.reps)||0,completed:true}));return []},
volume(workout){return (workout.exercises||[]).reduce((sum,e)=>sum+this.setsOf(e).reduce((s,x)=>s+(Number(x.kg)||0)*(Number(x.reps)||0),0),0)},
maxLoad(exercise){return Math.max(0,...this.setsOf(exercise).map(x=>Number(x.kg)||0))},
maxReps(exercise){return Math.max(0,...this.setsOf(exercise).map(x=>Number(x.reps)||0))}
};
