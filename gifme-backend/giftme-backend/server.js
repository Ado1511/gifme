import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import gifRoutes from './routes/gif.js';
import verifyToken from './middlewares/authMiddleware.js';
import socialRoutes from './routes/social.js';
import searchRoutes from './routes/search.js';
import giphyRoutes from './routes/giphy.js';
import notificationRoutes from './routes/notification.js';
import User from './models/User.js';
import { seedDatabase } from './utils/seedData.js'; // ✅ agregado!

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config(); 
console.log("🔐 JWT_SECRET:", process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 5000;

// 🔌 Conexión a MongoDB y seeding condicional
connectDB().then(async () => {
  console.log('✅ MongoDB connected');

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('🌱 No users found. Seeding initial data...');
    await seedDatabase(); // ✅ nombre correcto
  } else {
    console.log(`📦 ${userCount} users found. Skipping seed.`);
  }
});

// 🧱 Middlewares
app.use(cors());
app.use(express.json());

// 🛡️ Ruta protegida de prueba
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.id}, you accessed a protected route 🔐`,
  });
});

// 📦 Rutas
app.use('/api/auth', authRoutes);
app.use('/api/gif', gifRoutes); // ✅ importante para el feed
app.use('/api/social', socialRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/giphy', giphyRoutes);
app.use('/api/notifications', notificationRoutes);

// 🧪 Ruta raíz
app.get('/', (req, res) => {
  res.send('🚀 GiftME API running');
});

// 🖼️ Servir archivos subidos
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
