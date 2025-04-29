import express from 'express';
import {
  toggleFollow,
  getFollowers,
  getFollowing,
  getUserByUsername
} from '../controllers/userController.js';
import verifyToken from '../middlewares/authMiddleware.js';
import User from '../models/User.js'; // ✅ Importar modelo de usuario

const router = express.Router();

// 👉 Seguir o dejar de seguir a un usuario
router.put('/follow/:userId', verifyToken, toggleFollow);

// 👉 Obtener seguidores de un usuario por su ID
router.get('/followers/:userId', getFollowers);

// 👉 Obtener a quién sigue un usuario (por su ID)
router.get('/following/:userId', getFollowing);

// 👉 Obtener un usuario por su nombre de usuario (para el perfil)
router.get('/by-username/:username', getUserByUsername);

// ✅ NUEVA RUTA para obtener a quién sigue el usuario logueado
router.get('/following', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('following', 'username avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.following);
  } catch (error) {
    console.error('❌ Error fetching following list:', error.message);
    res.status(500).json({ message: 'Error fetching following list' });
  }
});

export default router;
