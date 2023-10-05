// validateOrder.js
const validateOrder = (req, res, next) => {
    const { userId, type, token, price, quantity } = req.body;
  
    
    if (!userId || !type || !token || !price || !quantity) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
  
  
    // If all validation checks pass, proceed to the next middleware/route handler
    next();
  };
  
  module.exports = validateOrder;
  