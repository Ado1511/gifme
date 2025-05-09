import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    // Solo log de advertencia, sin saturar consola
    if (process.env.NODE_ENV !== 'production') {
      console.warn('🔒 No token provided');
    }
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Log solo si estás en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Token verified for user:', decoded.username || decoded.id);
    }

    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

export default verifyToken;
