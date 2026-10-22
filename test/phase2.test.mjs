import test from 'node:test';
import assert from 'node:assert/strict';
import {seed, createCase, submitFeedback, publicState} from '../domain.mjs';
import {calculateKpis} from '../metrics.mjs';
import {calculateFinancialModel, sensitivity} from '../financial.mjs';

test('feedback metrics calculate CSAT, CES, response rate and missing responses', () => {
  const db=seed();
  let kpis=calculateKpis(db);
  assert.equal(kpis.metrics.csat.value,100);
  assert.equal(kpis.metrics.csat.sampleSize,1);
  assert.equal(kpis.metrics.ces.value,2);
  assert.equal(kpis.metrics.acknowledgementMinutes.sampleSize,0);
  assert.equal(kpis.metrics.surveyResponseRate.value,100);
  const c=createCase(db,{category:'Bag',date:'2026-10-12',item:'Synthetic second bag',color:'Blue',description:'Synthetic',train:'Demo',station:'Nürnberg Hbf',routeId:'north'});
  kpis=calculateKpis(db);
  assert.equal(kpis.metrics.surveyResponseRate.value,50);
  assert.equal(kpis.metrics.surveyResponseRate.missingResponses,1);
  submitFeedback(db,{caseId:c.id,csat:5,ces:1,communication:5,confidence:5,transparency:5,timing:'after-update',comments:''});
  assert.equal(calculateKpis(db).metrics.surveyResponseRate.value,100);
  assert.throws(()=>submitFeedback(db,{caseId:c.id,csat:5,ces:1,communication:5,confidence:5,transparency:5}));
  assert.doesNotMatch(JSON.stringify(publicState(db)), /Synthetic unresolved-case response/);
});

test('event timestamps drive deterministic operational KPI durations', () => {
  const db=seed();
  const c=db.cases[0];
  c.events[0].at='2026-10-01T10:00:00.000Z';
  c.searchTasks[0].sentAt='2026-10-01T10:01:00.000Z';
  c.searchTasks[0].ackAt='2026-10-01T10:06:00.000Z';
  c.searchTasks[0].status='Checked — not found';
  c.searchTasks[0].responseAt='2026-10-01T10:16:00.000Z';
  const kpis=calculateKpis(db,{asOf:'2026-10-01T10:20:00.000Z'});
  assert.equal(kpis.metrics.firstAssignedMinutes.value,1);
  assert.equal(kpis.metrics.acknowledgementMinutes.value,6);
  assert.equal(kpis.metrics.firstUpdateMinutes.value,16);
});

test('financial model keeps item value separate from operator benefit and exposes sensitivity', () => {
  const model=calculateFinancialModel({annualCaseVolume:1000,baselineRecoveryRate:60,improvementPoints:10,averageItemValue:100,minutesSavedPerCase:6,staffCostPerHour:30,implementationCosts:10000,recurringOperatingCosts:5000});
  assert.equal(model.outputs.additionalItemsReturned,100);
  assert.equal(model.outputs.additionalItemValueReturned,10000);
  assert.equal(model.outputs.staffHoursReleased,100);
  assert.equal(model.outputs.grossStaffCapacityValue,3000);
  assert.equal(model.outputs.yearOneNetModelledBenefit,-12000);
  assert.match(model.caveat,/not counted as operator financial savings/i);
  const scenarios=sensitivity({annualCaseVolume:1000,improvementPoints:10,minutesSavedPerCase:6});
  assert.ok(scenarios.low.outputs.yearOneNetModelledBenefit<scenarios.base.outputs.yearOneNetModelledBenefit);
  assert.ok(scenarios.high.outputs.yearOneNetModelledBenefit>scenarios.base.outputs.yearOneNetModelledBenefit);
});
