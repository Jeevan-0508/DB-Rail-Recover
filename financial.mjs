export const FINANCIAL_DEFAULTS={annualCaseVolume:250000,baselineRecoveryRate:60,improvementPoints:5,averageItemValue:120,minutesSavedPerCase:8,staffCostPerHour:35,implementationCosts:250000,recurringOperatingCosts:120000};
const num=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
export function calculateFinancialModel(input={}){
  const p={...FINANCIAL_DEFAULTS,...Object.fromEntries(Object.keys(FINANCIAL_DEFAULTS).map(k=>[k,num(input[k],FINANCIAL_DEFAULTS[k])]))};
  p.baselineRecoveryRate=Math.min(100,Math.max(0,p.baselineRecoveryRate));p.improvementPoints=Math.max(0,Math.min(100-p.baselineRecoveryRate,p.improvementPoints));
  const additionalItemsReturned=p.annualCaseVolume*p.improvementPoints/100;
  const additionalItemValueReturned=additionalItemsReturned*p.averageItemValue;
  const staffHoursReleased=p.annualCaseVolume*p.minutesSavedPerCase/60;
  const grossStaffCapacityValue=staffHoursReleased*p.staffCostPerHour;
  const annualOperatingCosts=p.recurringOperatingCosts;
  const yearOneNetModelledBenefit=grossStaffCapacityValue-annualOperatingCosts-p.implementationCosts;
  const steadyStateNetModelledBenefit=grossStaffCapacityValue-annualOperatingCosts;
  return {dataClass:'hypothetical business-case assumptions',assumptions:p,outputs:{additionalItemsReturned,additionalItemValueReturned,staffHoursReleased,grossStaffCapacityValue,annualOperatingCosts,yearOneNetModelledBenefit,steadyStateNetModelledBenefit},caveat:'Returned item value is shown separately and is not counted as operator financial savings.'};
}
export function sensitivity(input={}){
  return {low:calculateFinancialModel({...input,improvementPoints:num(input.improvementPoints,5)-2,minutesSavedPerCase:num(input.minutesSavedPerCase,8)-3}),base:calculateFinancialModel(input),high:calculateFinancialModel({...input,improvementPoints:num(input.improvementPoints,5)+2,minutesSavedPerCase:num(input.minutesSavedPerCase,8)+3})};
}
