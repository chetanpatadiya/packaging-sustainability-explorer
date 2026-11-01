/* Packaging Sustainability Opportunity Explorer V0.1 — calculation kernel.
   Pure functions: no I/O, network access, persistent state or UI dependency.
   Scenario outputs are not verified environmental claims. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PSOECore = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const numberFields = ['opening','purchases','applied','scrap','necessary','closing','other','atRisk','massGrams','unitCost','reductionPercent'];
  const countFields = ['opening','purchases','applied','scrap','necessary','closing','other','atRisk'];
  const flags = ['labelControl','sterileBarrier','productProtection','validatedSystem'];
  const interventions = ['On-demand printing','MOQ / order policy change','Process setup reduction','Prevent premature obsolescence','Material yield improvement','Packaging component redesign','Other process change'];
  const categories = ['Printed label','Printed insert / IFU','Carton / shipper','Protective packaging','Sterile barrier component','Other packaging component'];

  function blankComponent(id) {
    return {id,name:'New packaging component',category:'Other packaging component',opening:0,purchases:0,applied:0,scrap:0,necessary:0,closing:0,other:0,atRisk:0,massGrams:0,unitCost:0,reductionPercent:0,intervention:'Other process change',dataQuality:'Estimate',source:'',notes:'',labelControl:false,sterileBarrier:false,productProtection:false,validatedSystem:false};
  }
  function demoAssessment() {
    const comp = blankComponent('demo-1');
    Object.assign(comp,{name:'Label family A — synthetic example',category:'Printed label',purchases:10000,applied:8900,scrap:400,necessary:100,closing:700,atRisk:700,massGrams:0.75,unitCost:0.10,reductionPercent:70,intervention:'On-demand printing',dataQuality:'Synthetic',source:'Illustrative input values for method testing; not employer or experimental data',labelControl:true,validatedSystem:true,notes:'The 700 ending labels are usable at-risk inventory, NOT confirmed scrap. Scenario reduction applies only to 300 avoidable scrap units.'});
    return {schema:'psoe.v0.1',project:'Synthetic demonstration — label waste screening',periodMonths:12,components:[comp]};
  }
  function blankAssessment() { return {schema:'psoe.v0.1',project:'New sustainability assessment',periodMonths:12,components:[blankComponent('component-1')]}; }
  function isFiniteNumber(value) { return typeof value==='number' && Number.isFinite(value); }
  function safeNumber(value) { if (value === '' || value === null || value === undefined) return NaN; const n=Number(value);return Number.isFinite(n)?n:NaN; }
  function normalizeAssessment(raw) {
    if (!raw || raw.schema !== 'psoe.v0.1' || !Array.isArray(raw.components) || raw.components.length>80) throw new Error('Unsupported, empty, or oversized V0.1 file.');
    const ids=new Set();
    const list=raw.components.map((obj,i)=>{
      const c=blankComponent('import-'+(i+1));
      if (!obj || typeof obj !== 'object') throw new Error('Invalid component entry.');
      for (const k of numberFields) c[k]=safeNumber(obj[k]);
      for (const k of ['name','category','intervention','dataQuality','source','notes']) c[k]=String(obj[k]??c[k]).slice(0,600);
      for (const k of flags) c[k]=obj[k]===true;
      c.id=String(obj.id??'import-'+(i+1)).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,45)||'import-'+(i+1);
      if (ids.has(c.id)) c.id='import-'+i+'-'+c.id;ids.add(c.id);
      if(!categories.includes(c.category)) c.category='Other packaging component';
      if(!interventions.includes(c.intervention))c.intervention='Other process change';
      if(!['Measured','Documented estimate','Estimate','Synthetic'].includes(c.dataQuality))c.dataQuality='Estimate';
      return c;
    });
    return {schema:'psoe.v0.1',project:String(raw.project??'Imported assessment').slice(0,120),periodMonths:safeNumber(raw.periodMonths),components:list};
  }
  function auditComponent(c,months) {
    const errors=[],warnings=[];
    if(!isFiniteNumber(months)||months<1||months>120||!Number.isInteger(months)) errors.push('Assessment period must be a whole number of months from 1 to 120.');
    for (const k of numberFields) {
      if(!isFiniteNumber(c[k])) errors.push(k+' must be a finite number.');
      else if(c[k]<0) errors.push(k+' must not be negative.');
    }
    for(const k of countFields) if(isFiniteNumber(c[k])&&!Number.isSafeInteger(c[k])) errors.push(k+' must be whole units.');
    if (isFiniteNumber(c.reductionPercent) && c.reductionPercent>100) errors.push('Scenario reduction cannot exceed 100%.');
    if (isFiniteNumber(c.necessary)&&isFiniteNumber(c.scrap)&&c.necessary>c.scrap) errors.push('Necessary process consumption exceeds confirmed scrap.');
    if (isFiniteNumber(c.atRisk)&&isFiniteNumber(c.closing)&&c.atRisk>c.closing) errors.push('At-risk inventory exceeds closing usable inventory.');
    const allQuantities=countFields.every(k=>isFiniteNumber(c[k]));
    let delta=null;
    if(allQuantities){
      delta=c.opening+c.purchases-c.applied-c.scrap-c.closing-c.other;
      if(Math.abs(delta)>0.000001)errors.push('Inventory does not reconcile: unmatched '+(delta>0?'positive':'negative')+' flow of '+Math.abs(delta).toLocaleString('en-US')+' units.');
    }
    if(c.massGrams===0)warnings.push('Mass per component is unknown or zero: do not interpret mass results.');
    if(c.dataQuality!=='Measured')warnings.push('Baseline provenance is '+(c.dataQuality||'unspecified')+'; verify before any operational claim.');
    if(!String(c.source||'').trim())warnings.push('No supporting record or source has been identified.');
    if(c.atRisk>0)warnings.push('At-risk closing inventory is a separate exposure, not confirmed waste.');
    if(c.category==='Sterile barrier component'&&!c.sterileBarrier)warnings.push('Confirm whether proposed change affects sterile barrier integrity.');
    const valid=errors.length===0;
    const avoidable=valid?Math.max(0,c.scrap-c.necessary):null;
    const prevented=valid?avoidable*c.reductionPercent/100:null;
    const throughput=valid?(c.applied+c.scrap):null;
    const factor=valid?12/months:null;
    const massValid=valid&&c.massGrams>0;
    return {valid,errors,warnings,delta,
      avoidable,
      prevented,
      projectedScrap:valid?c.scrap-prevented:null,
      wasteRate:valid&&throughput>0?100*c.scrap/throughput:null,
      annualPrevented:valid?prevented*factor:null,
      confirmedMassKg:massValid?c.scrap*c.massGrams/1000:null,
      preventableMassKg:massValid?avoidable*c.massGrams/1000:null,
      annualPreventedMassKg:massValid?prevented*c.massGrams/1000*factor:null,
      atRiskMassKg:massValid?c.atRisk*c.massGrams/1000:null,
      annualGrossValue:valid&&c.unitCost>0?prevented*c.unitCost*factor:null,
      riskReview:c.labelControl||c.sterileBarrier||c.productProtection||c.validatedSystem?'Elevated review triggers':'Change-control assessment still required'
    };
  }
  function calculate(assessment) {
    const months=assessment.periodMonths;
    const details=assessment.components.map(component=>({component,...auditComponent(component,months)}));
    const valid=details.filter(x=>x.valid);
    function sum(k){return valid.reduce((n,x)=>n+(x[k]??0),0);}
    return {details,validCount:valid.length,invalidCount:details.length-valid.length,totalCount:details.length,
      totals:{scrapUnits:valid.reduce((s,x)=>s+x.component.scrap,0),avoidableUnits:sum('avoidable'),preventedUnits:sum('prevented'),annualPreventedUnits:sum('annualPrevented'),annualPreventedMassKg:sum('annualPreventedMassKg'),annualGrossValue:sum('annualGrossValue'),atRiskUnits:valid.reduce((s,x)=>s+x.component.atRisk,0),atRiskMassKg:sum('atRiskMassKg'),withMass:valid.filter(x=>x.component.massGrams>0).length,withCost:valid.filter(x=>x.component.unitCost>0).length}};
  }
  return {numberFields,countFields,flags,interventions,categories,blankComponent,blankAssessment,demoAssessment,normalizeAssessment,auditComponent,calculate};
});
