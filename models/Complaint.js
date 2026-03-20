const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  address: { type: String, required: true },
  city: String,
  pincode: String,
  productBrand: String,
  productModel: String,
  issueType: { type: String, required: true },
  issueDescription: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed', 'Cancelled'],
    default: 'Pending'
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTechnicianName: String,
  scheduledDate: Date,
  resolvedDate: Date,
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: String,
    timestamp: { type: Date, default: Date.now }
  }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes: String
}, { timestamps: true });

complaintSchema.pre('save', function(next) {
  if (!this.complaintId) {
    const date = new Date();
    const prefix = 'CMP';
    const timestamp = date.getFullYear().toString().slice(-2) +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.complaintId = `${prefix}${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
