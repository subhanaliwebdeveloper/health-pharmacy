export const required=(obj,fields)=>fields.filter(f=>obj[f]===undefined||obj[f]===null||String(obj[f]).trim()==='');
