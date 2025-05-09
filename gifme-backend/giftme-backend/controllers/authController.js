import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Gif from '../models/gif.js';

// 🔐 REGISTRO
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const avatarUrl = req.body.avatarUrl;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const avatarFinal = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`
      : avatarUrl || undefined;

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: avatarFinal,
    });

    await newUser.save();

    const token = jwt.sign({
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      role: newUser.role,
      isVerified: newUser.isVerified,
    }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      message: 'User registered successfully ✅',
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    });
  } catch (err) {
    console.error('❌ Error in register:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔑 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
    }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 👤 USUARIO LOGUEADO ACTUAL
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    console.error('❌ Error fetching current user:', error.message);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// 👤 ACTUALIZAR PERFIL (incluye avatar opcional)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body; // solo username viene de body (text)

    // Generar nueva URL si hay avatar
    const avatarUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`
      : undefined; // solo actualizar si se subió algo

    // Crear objeto de actualización
    const updateData = { username };
    if (avatarUrl) updateData.avatar = avatarUrl;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully ✅',
      user: updatedUser,
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error.message);
    res.status(500).json({ message: 'Error updating profile' });
  }
};


// 🔍 Ver seguidores
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('followers', 'username avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.followers);
  } catch (error) {
    console.error('❌ Error getting followers:', error.message);
    res.status(500).json({ message: 'Error fetching followers' });
  }
};

// 🔎 Ver seguidos
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('following', 'username avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.following);
  } catch (error) {
    console.error('❌ Error getting following:', error.message);
    res.status(500).json({ message: 'Error fetching following' });
  }
};

// 🚫 Eliminar cuenta de usuario
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await Gif.deleteMany({ uploadedBy: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account and all user data deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting account:', error.message);
    res.status(500).json({ message: 'Error deleting account' });
  }
};

// ✅ Verificar cuenta (solo admin o para pruebas)
export const verifyAccount = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'User verified successfully ✅' });
  } catch (error) {
    console.error('❌ Error verifying account:', error.message);
    res.status(500).json({ message: 'Error verifying account' });
  }
};
