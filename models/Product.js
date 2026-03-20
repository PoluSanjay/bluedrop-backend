const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['Water Purifiers', 'Spare Parts'] },
  subcategory: { type: String, required: true },
  brand: { type: String, required: true, enum: ['Kent', 'Aquaguard', 'Livpure', 'BlueDrop'] },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String, required: true },
  images: [String],
  description: { type: String, required: true },
  specifications: { type: Map, of: String },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', brand: 'text', subcategory: 'text' });

module.exports = mongoose.model('Product', productSchema);
