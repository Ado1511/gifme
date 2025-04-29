import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Gif from '../models/gif.js';
import bcrypt from 'bcryptjs';

// 📌 Cargamos las variables de entorno
dotenv.config();

// 📌 Datos de prueba
const usersData = [
  { username: 'ado1511', email: 'ado@example.com', password: 'ado12345' },
  { username: 'testuser1', email: 'test1@example.com', password: 'password123' },
  { username: 'testuser2', email: 'test2@example.com', password: 'password123' },
  { username: 'testuser3', email: 'test3@example.com', password: 'password123' },
];

const gifsData = [
  {
    url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    caption: 'Funny cat 😹',
  },
  {
    url: 'https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif',
    caption: 'Coding time! 👨‍💻',
  },
  {
    url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
    caption: 'Good vibes only 🌈',
  },
];

export async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🚀 Connected to MongoDB');

    // 🧹 Limpiamos la base de datos
    await User.deleteMany({});
    await Gif.deleteMany({});
    console.log('🧹 Database cleaned');

    // 🔒 Hasheamos passwords
    const hashedUsers = await Promise.all(
      usersData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    // 👥 Crear usuarios
    const createdUsers = await User.insertMany(hashedUsers);
    console.log('✅ Users created');

    // 📷 Crear GIFs
    const gifsWithOwners = gifsData.map((gif, index) => ({
      ...gif,
      uploadedBy: createdUsers[(index % (createdUsers.length - 1)) + 1]._id, // Test users suben gifs
    }));

    await Gif.insertMany(gifsWithOwners);
    console.log('✅ GIFs created');

    // 🤝 ado1511 sigue a todos los test users
    const mainUser = createdUsers[0]; // ado1511
    mainUser.following = createdUsers.slice(1).map((u) => u._id);
    await mainUser.save();
    console.log('✅ ado1511 is now following test users');

    console.log('🌟 Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}
