import {describe,it,expect} from 'vitest';
import {validateReading} from '../utils/readingValidation.js';
const today=new Date(2026,10,11);
const valid={date:'2026-11-11',slot:'morning',value:'110'};
describe('glucose reading validation',()=>{
 it('accepts a valid reading',()=>expect(validateReading(valid,today)).toBeNull());
 it('requires a value',()=>expect(validateReading({...valid,value:''},today)).toMatch(/enter a glucose value/));
 it('rejects decimals and values outside 40-600',()=>{expect(validateReading({...valid,value:'99.5'},today)).toMatch(/between 40 and 600/);expect(validateReading({...valid,value:'601'},today)).toMatch(/between 40 and 600/);expect(validateReading({...valid,value:'39'},today)).toMatch(/between 40 and 600/)});
 it('rejects a future date',()=>expect(validateReading({...valid,date:'2026-11-12'},today)).toMatch(/future/));
 it('rejects impossible calendar dates',()=>expect(validateReading({...valid,date:'2026-02-30'},today)).toMatch(/valid date/));
 it('rejects an invalid slot',()=>expect(validateReading({...valid,slot:'bedtime'},today)).toMatch(/time slot/));
});
