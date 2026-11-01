/* Browser UI. No network calls, remote libraries or telemetry. */
(() => {
  'use strict';
  const Core=window.PSOECore;
  if(!Core) throw new Error('Calculation kernel unavailable.');
  const STORAGE='psoe.v0.1.assessment';
  let state;
  try { const saved=localStorage.getItem(STORAGE);state=saved?Core.normalizeAssessment(JSON.parse(saved)):Core.demoAssessment(); }
  catch(e){state=Core.demoAssessment();}
  let currentTab='baseline', nextId=1;
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=(n,d=0)=>n===null||!Number.isFinite(n)?'—':new Intl.NumberFormat('en-US',{minimumFractionDigits:0,maximumFractionDigits:d}).format(n);
  const usd=n=>n===null||!Number.isFinite(n)?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
  function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch(e){notify('Browser storage unavailable. Use Save JSON to preserve work.');}}
  function notify(message){$('#notice').textContent=message;}
  function field(c,k,label,desc,step='1') {return `<div class="field"><label for="${esc(c.id+'-'+k)}">${esc(label)}</label><input id="${esc(c.id+'-'+k)}" type="number" min="0" step="${step}" data-id="${esc(c.id)}" data-field="${k}" value="${Number.isFinite(c[k])?c[k]:''}">${desc?`<span class="hint">${esc(desc)}</span>`:''}</div>`;}
  function textField(c,k,label,max=140){return `<div class="field"><label for="${esc(c.id+'-'+k)}">${esc(label)}</label><input id="${esc(c.id+'-'+k)}" type="text" maxlength="${max}" data-id="${esc(c.id)}" data-field="${k}" value="${esc(c[k])}"></div>`;}
  function selectField(c,k,label,options){return `<div class="field"><label for="${esc(c.id+'-'+k)}">${esc(label)}</label><select id="${esc(c.id+'-'+k)}" data-id="${esc(c.id)}" data-field="${k}">${options.map(opt=>`<option value="${esc(opt)}"${c[k]===opt?' selected':''}>${esc(opt)}</option>`).join('')}</select></div>`;}
  function status(detail){return detail.valid?`<span class="flag ok">Flow reconciled</span>`:`<span class="flag error">${detail.errors.length} audit issue${detail.errors.length===1?'':'s'}</span>`;}
  function renderMetrics(calc){
    const t=calc.totals;
    const arr=[{l:'Confirmed scrap',v:fmt(t.scrapUnits)+' units',s:'Reconciled component records only'},{l:'Potentially avoidable',v:fmt(t.avoidableUnits)+' units',s:'After necessary process consumption'},{l:'Scenario prevention / year',v:t.withMass?fmt(t.annualPreventedMassKg,3)+' kg':'—',s:t.withMass<calc.validCount?'Partial mass coverage — see details':'Assumed process improvements'},{l:'Gross material value / year',v:t.withCost?usd(t.annualGrossValue):'—',s:t.withCost<calc.validCount?'Partial or unavailable cost coverage; not ROI':'Not net savings or ROI'}];
    $('#summary').innerHTML=arr.map(m=>`<article class="metric"><div class="label">${m.l}</div><div class="value">${m.v}</div><div class="sub">${m.s}</div></article>`).join('');
  }
  function renderBaseline(calc){
    $('#components').innerHTML=calc.details.map((r,i)=>{
      const c=r.component;
      return `<article class="component"><div class="component-top"><div><div class="label-small">COMPONENT ${i+1}</div><h3>${esc(c.name||'Untitled component')}</h3><p>${esc(c.category)}</p></div><div>${status(r)} ${state.components.length>1?`<button type="button" class="text-button danger" data-remove="${esc(c.id)}">Remove</button>`:''}</div></div>
      <div class="field-grid wide">${textField(c,'name','Component / SKU family')}${selectField(c,'category','Component type',Core.categories)}${selectField(c,'dataQuality','Baseline evidence class',['Measured','Documented estimate','Estimate','Synthetic'])}</div>
      <h4 class="group-heading">Material balance · quantities within assessment period</h4>
      <div class="field-grid">${field(c,'opening','Opening usable inventory','Units at start')}${field(c,'purchases','Received units','Receipts in this period')}${field(c,'applied','Released-product use','Good production units')}${field(c,'scrap','Confirmed scrap','Includes necessary process use')}${field(c,'necessary','Necessary process consumption','Included in confirmed scrap')}${field(c,'closing','Closing usable inventory','Not automatically waste')}${field(c,'other','Other documented outflow','Transfers, returns, etc.')}${field(c,'atRisk','At-risk usable inventory','Subset of closing inventory')}</div>
      <h4 class="group-heading">Material characterization and provenance</h4><div class="field-grid wide">${field(c,'massGrams','Mass / component (g)','0 = unavailable','any')}${field(c,'unitCost','Material cost / unit (USD)','0 = unavailable; not net savings','any')}${textField(c,'source','Evidence / record reference',450)}</div>
      <div class="audit-strip"><span><strong>Audit:</strong> ${status(r)}</span><span>Unmatched units: <strong>${fmt(r.delta)}</strong></span><span>Confirmed scrap rate (throughput): <strong>${r.wasteRate===null?'—':fmt(r.wasteRate,2)+'%'}</strong></span><span>Avoidable units: <strong>${fmt(r.avoidable)}</strong></span></div>
      ${r.errors.length?`<div class="attention"><strong>Must resolve:</strong> ${r.errors.map(esc).join(' · ')}</div>`:''}
      ${r.warnings.length?`<p class="result-note"><strong>Evidence notes:</strong> ${r.warnings.map(esc).join(' · ')}</p>`:''}
      </article>`;
    }).join('');
  }
  function renderScenarios(calc){
    $('#scenarioCards').innerHTML=calc.details.map((r,i)=>{
      const c=r.component;
      const disable=!r.valid?'<div class="attention">Reconcile the baseline in Step 01 before using these quantitative results.</div>':'';
      return `<article class="scenario-card"><div class="scenario-top"><div><div class="label-small">INTERVENTION ${i+1}</div><h3>${esc(c.name)}</h3></div>${status(r)}</div>
      <div class="scenario-grid"><div>
      <div class="field">${selectField(c,'intervention','Proposed process change',Core.interventions)}</div>
      <div class="group-heading">Expected reduction of avoidable waste</div>
      <div class="range-row"><input aria-label="Reduction percentage for ${esc(c.name)}" type="range" min="0" max="100" step="5" data-id="${esc(c.id)}" data-field="reductionPercent" value="${Number.isFinite(c.reductionPercent)?c.reductionPercent:0}"><output class="range-value" data-range-label="${esc(c.id)}">${fmt(c.reductionPercent)}%</output></div>
      <p class="result-note">This assumed effectiveness is applied to ${fmt(r.avoidable)} avoidable units only. Confirmed scrap includes necessary process consumption that cannot be counted as savings without separate qualification.</p>
      <label class="label-small" for="${esc(c.id)}-notes">Scenario rationale / evidence needed</label><textarea id="${esc(c.id)}-notes" data-id="${esc(c.id)}" data-field="notes" maxlength="600">${esc(c.notes)}</textarea>
      </div><div><div class="impact-box"><div><span>Prevented units / year</span><b>${fmt(r.annualPrevented,1)}</b></div><div><span>Prevented mass / year</span><b>${r.annualPreventedMassKg===null?'—':fmt(r.annualPreventedMassKg,3)+' kg'}</b></div><div><span>Remaining scrap / assessment period</span><b>${fmt(r.projectedScrap,1)}</b></div><div><span>Gross material value / year</span><b>${usd(r.annualGrossValue)}</b></div></div>${disable}</div></div>
      <h4 class="group-heading">Impact-screening flags (check when applicable; unchecked does not mean cleared)</h4>
      <div class="check-grid">${[['labelControl','Label content, UDI, traceability or legibility'],['sterileBarrier','Sterile barrier performance / integrity'],['productProtection','Product protection, distribution or shelf life'],['validatedSystem','Equipment, software or process validation']].map(([k,l])=>`<label class="check-label"><input type="checkbox" data-id="${esc(c.id)}" data-field="${k}"${c[k]?' checked':''}>${l}</label>`).join('')}</div>
      <div class="attention"><strong>Gate:</strong> ${esc(r.riskReview)}. Quality / Regulatory ownership and formal change control remain required before any implementation.</div>
      </article>`;
    }).join('');
  }
  function renderResults(calc){
    const t=calc.totals;
    const rows=calc.details.map(r=>{
      const c=r.component;
      return `<tr><td><strong>${esc(c.name)}</strong><div class="muted">${esc(c.intervention)}</div></td><td>${status(r)}</td><td class="num">${fmt(r.avoidable)}</td><td class="num">${fmt(r.annualPrevented,1)}</td><td class="num">${fmt(r.annualPreventedMassKg,3)}</td><td class="num">${usd(r.annualGrossValue)}</td><td>${esc(r.riskReview)}</td></tr>`;
    }).join('');
    $('#resultsPanel').innerHTML=`<div class="result-card"><div class="label-small">OPPORTUNITY REGISTER</div><h3>Reconciled component scenarios</h3><div class="table-scroll"><table class="results-table"><thead><tr><th>Component / intervention</th><th>Baseline status</th><th class="num">Avoidable units</th><th class="num">Units prevented / yr</th><th class="num">kg prevented / yr</th><th class="num">Gross value / yr</th><th>Change control</th></tr></thead><tbody>${rows||'<tr><td colspan="7">No components entered.</td></tr>'}</tbody></table></div><p class="result-note">Annualized estimates use a linear 12 ÷ period-months scaling; seasonality and changes in product mix are not modeled. Monetary values exclude implementation costs, yield changes, MOQ and other operational effects.</p></div>
      <div class="result-card"><h3>Data completeness and interpretation</h3><p><span class="flag ${calc.invalidCount?'error':'ok'}">${calc.validCount} of ${calc.totalCount} components reconciled</span> <span class="pill">${t.withMass} with nonzero unit mass</span></p>
      ${calc.invalidCount?`<div class="attention">${calc.invalidCount} component(s) excluded from aggregate savings. Resolve their baseline errors before making a comparative claim.</div>`:''}
      ${calc.details.map(r=>`<div class="subsection"><strong>${esc(r.component.name)}</strong> · ${esc(r.component.dataQuality)} · ${r.valid?'Flow reconciled':'Reconciliation incomplete'}<div class="result-note">${r.warnings.concat(r.errors).map(esc).join(' · ')||'No additional model flags.'}</div><div class="result-note">Source: ${esc(r.component.source||'Not supplied')}</div></div>`).join('')}
      <div class="attention"><strong>Interpretation boundary:</strong> ${fmt(t.atRiskUnits)} at-risk usable units (${t.withMass?fmt(t.atRiskMassKg,3)+' kg':'mass unavailable'} for components with known masses) are NOT counted as confirmed waste or as achieved savings. CO₂, water, transport, energy, recycling benefits, and net ROI are outside V0.1.</div></div>`;
  }
  function render(){
    const calc=Core.calculate(state);
    $('#projectName').value=state.project;
    $('#periodMonths').value=Number.isFinite(state.periodMonths)?state.periodMonths:'';
    renderMetrics(calc);renderBaseline(calc);renderScenarios(calc);renderResults(calc);
    for(const btn of document.querySelectorAll('[data-tab]')) {const active=btn.dataset.tab===currentTab;btn.classList.toggle('active',active);if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');}
    for(const panel of document.querySelectorAll('.tab-panel'))panel.hidden=panel.id!=='tab-'+currentTab;
  }
  function selectTab(t){currentTab=t;render();}
  document.querySelector('.tabs').addEventListener('click',e=>{const btn=e.target.closest('[data-tab]');if(btn)selectTab(btn.dataset.tab);});
  document.querySelector('#main').addEventListener('change',e=>{
    const el=e.target;
    if(el.id==='projectName'){state.project=el.value.slice(0,120);persist();render();return;}
    if(el.id==='periodMonths'){state.periodMonths=el.value===''?NaN:Number(el.value);persist();render();return;}
    if(el.id==='importJson'){const file=el.files&&el.files[0];if(!file)return;if(file.size>500000){notify('Import rejected: limit 500 KB.');el.value='';return;}
      file.text().then(s=>{state=Core.normalizeAssessment(JSON.parse(s));persist();notify('Imported V0.1 assessment. Check audit flags before using results.');currentTab='baseline';render();}).catch(err=>notify('Import failed: '+err.message));el.value='';return;}
    const id=el.dataset.id,k=el.dataset.field;if(!id||!k)return;
    const c=state.components.find(x=>x.id===id);if(!c)return;
    if(Core.numberFields.includes(k))c[k]=el.value===''?NaN:Number(el.value);
    else if(Core.flags.includes(k))c[k]=el.checked;
    else if(['name','category','intervention','dataQuality','source','notes'].includes(k))c[k]=el.value.slice(0,k==='notes'?600:450);
    else return;
    persist();render();
  });
  document.querySelector('#main').addEventListener('input',e=>{const el=e.target;if(el.matches('input[type="range"][data-id]')){const out=document.querySelector(`[data-range-label="${el.dataset.id}"]`);if(out)out.textContent=el.value+'%';}});
  $('#addComponentBtn').addEventListener('click',()=>{if(state.components.length>=80){notify('Maximum 80 components in V0.1.');return;}const c=Core.blankComponent('component-'+Date.now()+'-'+(nextId++));state.components.push(c);persist();render();notify('Component added. Enter a reconciled assessment-period flow.');});
  $('#components').addEventListener('click',e=>{const el=e.target.closest('[data-remove]');if(!el)return;if(!window.confirm('Remove this component? This will update saved local data.'))return;state.components=state.components.filter(x=>x.id!==el.dataset.remove);persist();render();});
  $('#demoBtn').addEventListener('click',()=>{if(!window.confirm('Replace the current assessment with synthetic demonstration data? Save JSON first if needed.'))return;state=Core.demoAssessment();persist();render();notify('Synthetic example loaded. These are not measured waste results.');});
  $('#clearBtn').addEventListener('click',()=>{if(!window.confirm('Clear all saved assessment data in this browser?'))return;state=Core.blankAssessment();persist();currentTab='baseline';render();notify('Saved assessment reset to blank.');});
  function download(data,name,type){const blob=new Blob([data],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);}
  $('#exportJsonBtn').addEventListener('click',()=>download(JSON.stringify(state,null,2),'psoe-assessment-v0.1.json','application/json'));
  function csvCell(s){let v=String(s??'');if(/^[\s]*[=+@-]/.test(v)&&isNaN(Number(v)))v="'"+v;return '"'+v.replace(/"/g,'""')+'"';}
  $('#exportCsvBtn').addEventListener('click',()=>{
    const calc=Core.calculate(state);
    const cols=['assessment','period_months','component','type','intervention','evidence_class','record_source','opening','purchases','applied','scrap','necessary','closing','other','at_risk','unit_mass_g','unit_cost_usd','reconciled','unmatched_units','avoidable_units','assumed_reduction_pct','prevented_units_period','annual_prevented_units','annual_prevented_kg','annual_gross_material_value_usd','label_control_flag','sterile_barrier_flag','product_protection_flag','validated_system_flag','audit_errors'];
    const rows=calc.details.map(r=>{const c=r.component;return [state.project,state.periodMonths,c.name,c.category,c.intervention,c.dataQuality,c.source,c.opening,c.purchases,c.applied,c.scrap,c.necessary,c.closing,c.other,c.atRisk,c.massGrams,c.unitCost,r.valid,r.delta,r.avoidable,c.reductionPercent,r.prevented,r.annualPrevented,r.annualPreventedMassKg,r.annualGrossValue,c.labelControl,c.sterileBarrier,c.productProtection,c.validatedSystem,r.errors.join(' | ')];});
    download([cols,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n'),'psoe-opportunity-register-v0.1.csv','text/csv;charset=utf-8');
  });
  $('#printBtn').addEventListener('click',()=>window.print());
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
  render();
})();
