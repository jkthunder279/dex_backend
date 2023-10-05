// routes.js
const express = require('express');
const router = express.Router();
const OrderController = require('./controllers/OrderController');
const validateOrder = require('./middlewares/validateOrder');

// Create a new order
router.post('/orders', validateOrder, OrderController.createOrder);

// Listing all orders
router.get('/orders', OrderController.listOrders);

module.exports = router;