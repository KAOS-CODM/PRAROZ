const jwt = require('jsonwebtoken');
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'praroz_admin_secret';

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const [scheme, token] = auth.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!ADMIN_JWT_SECRET) {
    return res.status(500).json({ message: 'Admin auth misconfigured' });
  }

  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    if (!payload || payload.sub !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.admin = payload;
    return next();
  } catch (err) {
    console.error('Admin auth verify error:', err && err.message ? err.message : err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function adminValidateRoute(req, res) {
  const password = req.body?.password;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ valid: false });
  }

  if (!ADMIN_JWT_SECRET) return res.status(500).json({ valid: false });

  const token = jwt.sign({ sub: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '1d' });
  return res.json({ valid: true, token });
}

module.exports = {
  requireAdmin,
  adminValidateRoute,
};

