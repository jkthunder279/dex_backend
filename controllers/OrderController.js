const Order = require('../models/Order');


exports.createOrder = async (req, res) => {
  console.log('Request Body:', req.body);
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Could not create order' });
  }
};


exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Could not list orders' });
  }
};
