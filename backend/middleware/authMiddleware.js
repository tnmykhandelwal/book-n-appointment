const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get the token from the incoming request header
  const token = req.header('x-auth-token');

  // 2. Check if no token exists
  if (!token) {
    return res.status(401).json({ message: 'No token found, authorization denied' });
  }

  // 3. Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded user payload (id and role) to the request object
    req.user = decoded.user; 
    
    // Move to the next middleware or route handler
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};