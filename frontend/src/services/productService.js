import {request} from './api';export const getProducts=q=>request(`/products${q||''}`);export const getProduct=id=>request(`/products/${id}`);export const getCategories=()=>request('/categories');
