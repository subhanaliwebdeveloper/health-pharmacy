export const generateOrderId=()=>`HP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100+Math.random()*900)}`;
