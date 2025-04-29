import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js'; // Ajusta la ruta según tu estructura

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const userExists = await User.findOne({ username: 'ado' });
    if (userExists) {
      console.log('⚠️ El usuario "ado" ya existe');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('Ador#123', 10); // Cambia la contraseña si querés

    const newUser = new User({
      username: 'ado',
      email: 'ado@example.com',
      password: hashedPassword,
      avatar: 'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif',
      role: 'admin',
      isVerified: true,
    });

    await newUser.save();
    console.log('✅ Usuario administrador "ado" creado con éxito');
    process.exit();
  } catch (err) {
    console.error('❌ Error creando admin:', err);
    process.exit(1);
  }
};

createAdminUser();