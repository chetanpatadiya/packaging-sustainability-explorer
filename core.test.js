'use strict';
const assert=require('node:assert/strict');
const C=require('../core.js');
function close(actual,expected,msg){assert.ok(Math.abs(actual-expected)<1e-8,`${msg}: got ${actual}, expected ${expected}`);}
let n=0;
function test(name,fn){fn();n++;console.log('PASS',name);}
test('synthetic demonstration balances exactly',()=>{const d=C.demoAssessment(),x=C.calculate(d);assert.equal(x.validCount,1);assert.equal(x.details[0].delta,0);close(x.details[0].wasteRate,400/9300*100,'waste rate');});
test('avoidability excludes necessary process scrap',()=>{const x=C.calculate(C.demoAssessment()).details[0];assert.equal(x.avoidable,300);assert.equal(x.prevented,210);assert.equal(x.projectedScrap,190);});
test('prevention mass and gross value are correct',()=>{const x=C.calculate(C.demoAssessment()).details[0];close(x.annualPreventedMassKg,0.1575,'mass');close(x.annualGrossValue,21,'gross value');});
test('at-risk usable inventory is not waste',()=>{const x=C.calculate(C.demoAssessment()).details[0];assert.equal(x.component.atRisk,700);assert.equal(x.component.scrap,400);assert.equal(x.avoidable,300);close(x.atRiskMassKg,0.525,'at-risk mass');});
test('unmatched material flows excluded from aggregate',()=>{const d=C.demoAssessment();d.components[0].closing=701;const x=C.calculate(d);assert.equal(x.validCount,0);assert.equal(x.invalidCount,1);assert.equal(x.totals.avoidableUnits,0);});
test('negative purchase is invalid',()=>{const d=C.demoAssessment();d.components[0].purchases=-10;assert.equal(C.calculate(d).details[0].valid,false);});
test('non-integer count invalid',()=>{const d=C.demoAssessment();d.components[0].scrap=400.5;assert.equal(C.calculate(d).details[0].valid,false);});
test('necessary process use cannot exceed scrap',()=>{const d=C.demoAssessment();d.components[0].necessary=401;assert.equal(C.calculate(d).details[0].valid,false);});
test('at-risk cannot exceed closing usable inventory',()=>{const d=C.demoAssessment();d.components[0].atRisk=701;assert.equal(C.calculate(d).details[0].valid,false);});
test('annualization for six-month period is proportional',()=>{const d=C.demoAssessment();d.periodMonths=6;const x=C.calculate(d).details[0];assert.equal(x.annualPrevented,420);close(x.annualPreventedMassKg,0.315,'mass');});
test('zero mass remains unknown (not false zero mass benefit)',()=>{const d=C.demoAssessment();d.components[0].massGrams=0;const x=C.calculate(d).details[0];assert.equal(x.annualPreventedMassKg,null);assert.equal(x.annualPrevented,210);});
test('invalid reduction percent rejected',()=>{const d=C.demoAssessment();d.components[0].reductionPercent=101;assert.equal(C.calculate(d).details[0].valid,false);});
test('100% prevention still retains necessary process consumption',()=>{const d=C.demoAssessment();d.components[0].reductionPercent=100;const x=C.calculate(d).details[0];assert.equal(x.projectedScrap,100);});
test('import/export normalizes valid V0.1 data',()=>{const a=C.normalizeAssessment(JSON.parse(JSON.stringify(C.demoAssessment())));assert.equal(a.components[0].purchases,10000);assert.equal(C.calculate(a).validCount,1);});
test('missing numeric values cannot silently become zero',()=>{const d=C.demoAssessment();delete d.components[0].opening;const x=C.normalizeAssessment(JSON.parse(JSON.stringify(d)));assert.equal(C.calculate(x).validCount,0);});
test('empty receipts with valid existing inventory works',()=>{const a=C.blankAssessment();const c=a.components[0];c.opening=100;c.purchases=0;c.applied=80;c.scrap=10;c.necessary=4;c.closing=10;c.massGrams=1;c.reductionPercent=50;const x=C.calculate(a).details[0];assert.equal(x.valid,true);assert.equal(x.avoidable,6);assert.equal(x.prevented,3);});
test('zero throughput waste rate is not fabricated',()=>{const a=C.blankAssessment();const x=C.calculate(a).details[0];assert.equal(x.valid,true);assert.equal(x.wasteRate,null);});
test('unknown cost does not fabricate a dollar value',()=>{const a=C.demoAssessment();a.components[0].unitCost=0;const x=C.calculate(a);assert.equal(x.details[0].annualGrossValue,null);assert.equal(x.totals.withCost,0);});
test('numbers outside safe integer range rejected',()=>{const a=C.blankAssessment();a.components[0].purchases=Number.MAX_SAFE_INTEGER+1;assert.equal(C.calculate(a).details[0].valid,false);});
console.log(`\n${n} tests passed.`);
