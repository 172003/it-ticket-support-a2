const jwt = require('jsonwebtoken');
const User = require('../models/User');


const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  let user;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    user = await User.findById(decoded.id).select('-password');
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }


  if (!user) {
    return res.status(401).json({ message: 'Not authorized, user not found' });
  }

  req.user = user;
  return next();
};

module.exports = { protect };