const adminAuth = (req, res, next) => {
  // req.userId and req.userRole are set by the auth middleware
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = adminAuth;