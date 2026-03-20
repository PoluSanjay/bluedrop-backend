const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalComplaints, totalUsers, recentOrders, pendingComplaints] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Complaint.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
      Complaint.countDocuments({ status: 'Pending' })
    ]);

    const revenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      totalOrders,
      totalProducts,
      totalComplaints,
      totalUsers,
      pendingComplaints,
      totalRevenue: revenue[0]?.total || 0,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
