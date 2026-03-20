const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { auth, adminAuth } = require('../middleware/auth');

// Register complaint (public)
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address, city, pincode, productBrand, productModel, issueType, issueDescription } = req.body;
    if (!name || !phone || !address || !issueType || !issueDescription) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    const complaintData = {
      name, phone, email, address, city, pincode,
      productBrand, productModel, issueType, issueDescription,
      statusHistory: [{ status: 'Pending', note: 'Complaint registered', updatedBy: 'System' }]
    };
    if (req.user) complaintData.user = req.user._id;
    const complaint = await Complaint.create(complaintData);
    console.log(`📱 SMS sent to ${phone}: Complaint ${complaint.complaintId} registered. We'll contact you within 24 hours.`);
    res.status(201).json({
      complaintId: complaint.complaintId,
      status: complaint.status,
      message: 'Complaint registered successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Track complaint by ID (public)
router.get('/track/:complaintId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId })
      .select('-adminNotes -user');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's complaints
router.get('/my-complaints', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all complaints
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    const complaints = await Complaint.find(query)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update complaint status
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { status, note, assignedTechnicianName, scheduledDate, priority } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (status) complaint.status = status;
    if (assignedTechnicianName) complaint.assignedTechnicianName = assignedTechnicianName;
    if (scheduledDate) complaint.scheduledDate = scheduledDate;
    if (priority) complaint.priority = priority;
    if (status === 'Resolved') complaint.resolvedDate = new Date();

    complaint.statusHistory.push({
      status: status || complaint.status,
      note: note || `Status updated to ${status}`,
      updatedBy: 'Admin'
    });

    await complaint.save();
    console.log(`📱 SMS sent to ${complaint.phone}: Your complaint ${complaint.complaintId} status is now ${status}`);
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
