import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  deleteAccount,
  getFollowers,
  getFollowing,
  verifyAccount,
} from '../controllers/authController.js';

// 🚨 Cambiar las rutas de los middlewares así:
import verifyToken from '../middlewares/verifyToken.js';
import isAdmin from '../middlewares/isAdmin.js';
import avatarUpload from '../middlewares/avatarUpload.js';

const router = express.Router();

// 🔐 Register a new user (with optional avatar)
router.post('/register', avatarUpload.single('avatar'), register);

// 🔑 Login
router.post('/login', login);

// 👤 Get current logged-in user
router.get('/me', verifyToken, getCurrentUser);

// ⚙️ Update profile (username, avatar)
router.put('/update-profile', verifyToken, avatarUpload.single('avatar'), updateProfile);

// ❌ Delete user account
router.delete('/delete', verifyToken, deleteAccount);

// 🔍 Get user's followers
router.get('/followers/:userId', getFollowers);

// 🔍 Get user's following
router.get('/following/:userId', getFollowing);

// ✅ Verify a user account (admin only)
router.put('/verify/:userId', verifyToken, isAdmin, verifyAccount);

export default router;
