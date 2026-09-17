const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export async function request(path,options={}){const token=localStorage.getItem('hp_token');const headers=options.body instanceof FormData?{...(options.headers||{})}:{'Content-Type':'application/json',...(options.headers||{})};if(token)headers.Authorization=`Bearer ${token}`;const res=await fetch(`${API}${path}`,{...options,headers});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.message||'Request failed');return data}
export {API};
