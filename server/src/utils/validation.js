import {AppError} from './errors.js';
export const SLOTS=Object.freeze({morning:'Morning (fasting)',after_breakfast:'After breakfast',after_lunch:'After lunch',after_dinner:'After dinner'});
export function isValidDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const [y,m,d]=value.split('-').map(Number);
 const parsed=new Date(Date.UTC(y,m-1,d));
 return parsed.getUTCFullYear()===y&&parsed.getUTCMonth()===m-1&&parsed.getUTCDate()===d;
}
export function validateReading({date,slot,value}){
 if(!isValidDate(date))throw new AppError('Please select a valid date.');
 const now=new Date();const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 if(date>today)throw new AppError('Date cannot be in the future.');
 if(!Object.hasOwn(SLOTS,slot))throw new AppError('Please select a valid time slot.');
 if(value===''||value===null||value===undefined)throw new AppError('Please enter a glucose value.');
 const number=Number(value);
 if(!Number.isInteger(number)||number<40||number>600)throw new AppError('Value must be between 40 and 600 mg/dl.');
 return number;
}
