export function adminOnly(req, res, next) {
  const allowed = ['admin', 'super_admin'];
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: Admin access required' });
  }
  next();
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient privileges' });
    }
    next();
  };
}
