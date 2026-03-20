const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://bluedrop-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payment', require('./routes/payment'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'BlueDrop API running', timestamp: new Date().toISOString() });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bluedrop')
  .then(async () => {
    console.log('✅ MongoDB connected');
    // Seed admin user and sample data
    await seedData();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Seed initial data
async function seedData() {
  const User = require('./models/User');
  const Product = require('./models/Product');

  // Create admin if not exists
  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@bluedrop.com' });
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@bluedrop.com',
      password: hashedPassword,
      phone: '9999999999',
      role: 'admin'
    });
    console.log('✅ Admin user created');
  }

  // Seed products if none exist
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const sampleProducts = [
      {
        name: 'BlueDrop RO SmartPure 10L',
        category: 'Water Purifiers',
        subcategory: 'RO',
        brand: 'BlueDrop',
        price: 8999,
        originalPrice: 12999,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        description: 'Advanced 7-stage RO+UV+UF purification system with TDS controller. Perfect for areas with high TDS water.',
        specifications: { capacity: '10 Litres', stages: '7 Stage', warranty: '1 Year', power: '36W', tdsRange: 'Up to 2000 ppm' },
        stock: 50, rating: 4.5, reviewCount: 128, featured: true
      },
      {
        name: 'Kent Grand Plus 8L RO',
        category: 'Water Purifiers',
        subcategory: 'RO',
        brand: 'Kent',
        price: 14500,
        originalPrice: 18000,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        description: 'Kent Grand Plus with mineral RO technology. Saves up to 50% water with auto flush technology.',
        specifications: { capacity: '8 Litres', stages: '8 Stage', warranty: '1 Year', power: '60W', tdsRange: 'Up to 2000 ppm' },
        stock: 30, rating: 4.7, reviewCount: 256, featured: true
      },
      {
        name: 'Aquaguard Enhance NXT UV',
        category: 'Water Purifiers',
        subcategory: 'UV',
        brand: 'Aquaguard',
        price: 6500,
        originalPrice: 8500,
        image: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=400',
        description: 'UV water purifier with 6-litre storage. Ideal for municipal water supply with TDS below 500 ppm.',
        specifications: { capacity: '6 Litres', stages: '5 Stage', warranty: '1 Year', power: '25W', tdsRange: 'Below 500 ppm' },
        stock: 45, rating: 4.3, reviewCount: 89, featured: false
      },
      {
        name: 'Livpure Glo Star RO+UV',
        category: 'Water Purifiers',
        subcategory: 'RO',
        brand: 'Livpure',
        price: 9999,
        originalPrice: 13500,
        image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400',
        description: 'Compact wall-mounted RO+UV purifier. Ideal for small families with smart LED indicators.',
        specifications: { capacity: '7 Litres', stages: '7 Stage', warranty: '1 Year', power: '36W', tdsRange: 'Up to 1500 ppm' },
        stock: 25, rating: 4.4, reviewCount: 67, featured: true
      },
      {
        name: 'BlueDrop UF Pure Gravity',
        category: 'Water Purifiers',
        subcategory: 'UF',
        brand: 'BlueDrop',
        price: 2499,
        originalPrice: 3999,
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400',
        description: 'Non-electric gravity-based UF purifier. No electricity required, perfect for areas with power cuts.',
        specifications: { capacity: '15 Litres', stages: '3 Stage', warranty: '1 Year', power: '0W (Non-electric)', tdsRange: 'Any TDS' },
        stock: 80, rating: 4.1, reviewCount: 45, featured: false
      },
      {
        name: 'RO Membrane 75 GPD',
        category: 'Spare Parts',
        subcategory: 'Membrane',
        brand: 'BlueDrop',
        price: 850,
        originalPrice: 1200,
        image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400',
        description: 'High-quality 75 GPD RO membrane compatible with most RO purifiers. Long-lasting performance.',
        specifications: { gpd: '75 GPD', compatibility: 'Universal', lifespan: '2-3 years', material: 'TFC' },
        stock: 200, rating: 4.2, reviewCount: 34, featured: false
      },
      {
        name: 'Sediment Filter 10 inch',
        category: 'Spare Parts',
        subcategory: 'Sediment Filter',
        brand: 'BlueDrop',
        price: 120,
        originalPrice: 200,
        image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
        description: '5 micron spun polypropylene sediment filter. Removes dirt, rust and other large particles.',
        specifications: { micron: '5 Micron', size: '10 inch', lifespan: '3-6 months', type: 'Spun PP' },
        stock: 500, rating: 4.0, reviewCount: 112, featured: false
      },
      {
        name: 'Carbon Block Filter',
        category: 'Spare Parts',
        subcategory: 'Carbon Filter',
        brand: 'BlueDrop',
        price: 180,
        originalPrice: 280,
        image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400',
        description: 'Activated carbon block filter removes chlorine, bad taste and odor from water.',
        specifications: { micron: '10 Micron', size: '10 inch', lifespan: '6 months', type: 'Carbon Block' },
        stock: 400, rating: 4.1, reviewCount: 78, featured: false
      },
      {
        name: 'Booster Pump 24V DC',
        category: 'Spare Parts',
        subcategory: 'Motor',
        brand: 'BlueDrop',
        price: 650,
        originalPrice: 900,
        image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400',
        description: '24V DC booster pump for RO systems. Increases water pressure for better purification output.',
        specifications: { voltage: '24V DC', flow: '1.0 LPM', pressure: '80 PSI', lifespan: '3-5 years' },
        stock: 150, rating: 4.3, reviewCount: 56, featured: false
      },
      {
        name: 'Solenoid Valve (SV)',
        category: 'Spare Parts',
        subcategory: 'SV',
        brand: 'BlueDrop',
        price: 220,
        originalPrice: 350,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        description: 'Auto shut-off solenoid valve for RO purifiers. Stops water flow when tank is full.',
        specifications: { voltage: '24V DC', type: 'Normally Closed', compatibility: 'Universal RO', material: 'Food Grade' },
        stock: 300, rating: 4.0, reviewCount: 29, featured: false
      },
      {
        name: 'Post Carbon Filter',
        category: 'Spare Parts',
        subcategory: 'Post Carbon',
        brand: 'BlueDrop',
        price: 150,
        originalPrice: 220,
        image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
        description: 'In-line post carbon filter polishes water taste after RO membrane. Final stage purification.',
        specifications: { size: '10 inch', type: 'Granular AC', lifespan: '6-12 months', connections: '1/4 inch' },
        stock: 350, rating: 4.2, reviewCount: 41, featured: false
      },
      {
        name: 'Kent Pearl 8L RO+UV+UF',
        category: 'Water Purifiers',
        subcategory: 'RO',
        brand: 'Kent',
        price: 11500,
        originalPrice: 15000,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        description: 'Kent Pearl 3-in-1 purifier with RO+UV+UF purification. Wall-mountable with 8L storage tank.',
        specifications: { capacity: '8 Litres', stages: '8 Stage', warranty: '1 Year', power: '60W', tdsRange: 'Up to 2000 ppm' },
        stock: 20, rating: 4.6, reviewCount: 189, featured: true
      }
    ];
    await Product.insertMany(sampleProducts);
    console.log('✅ Sample products seeded');
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 BlueDrop Server running on port ${PORT}`);
});

module.exports = app;
