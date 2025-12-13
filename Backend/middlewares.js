const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();
// Middleware to check if token is valid
exports.auth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']; // lowercase
    // console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: 'Token missing or malformed' });
    }

    const token = authHeader.split(" ")[1]; // Extract actual token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);
    // console.log(req.user);
    req.user = decoded; // decoded usually contains userId, role, etc.
    // console.log(req);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Middleware to restrict access to specific roles
exports.authorizeRole = (...roles) => {
  return (req, res, next) => {
    // Grant full access to Developer role
    if (req.user.role === "Developer") {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied for role: ${req.user.role}`,
      });
    }
    next();
  };
};

exports.getUserEmail = async (req, res, next) => {
  try {
    const { userID } = req.body;

    // Check if userID is provided
    if (!userID) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required!',
      });
    }

    // Find user by userID
    const user = await User.findOne({ userID });

    // If user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found!',
      });
    }

    // Embed email into request for next controller
    req.body.email = user.email;

    // Proceed to next middleware/controller
    next();

  } catch (error) {
    console.error('Error in getUserEmail middleware:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
