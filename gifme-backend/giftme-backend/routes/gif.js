import express from 'express';
import {
  uploadGif,
  uploadGifFile,
  getAllGifs,
  getGifsByUser,
  getGifById,
  toggleLike,
  addComment,
  getGifComments,
  getFeedGifs,
  getExploreGifs,
  getLikedGifs,
  getCommentsByUser,
  deleteComment,
  deleteGif,
  likeComment
} from '../controllers/gifController.js';

import verifyToken from '../middlewares/authMiddleware.js';
import gifUpload from '../middlewares/gifUpload.js';

const router = express.Router();

// 📰 Feed (¡debe estar ANTES de rutas con :param!)
router.get('/feed', verifyToken, getFeedGifs);

// 🌎 Explorar
router.get('/explore', verifyToken, getExploreGifs);

// 📄 Obtener todos los GIFs
router.get('/', getAllGifs);

// 📤 Subir GIF por URL
router.post('/upload', verifyToken, uploadGif);

// 📤 Subir GIF como archivo
router.post('/upload-file', verifyToken, gifUpload.single('file'), uploadGifFile);

// ❤️ Like / Unlike GIF
router.put('/:gifId/like', verifyToken, toggleLike);

// 💬 Comentar
router.post('/:gifId/comment', verifyToken, addComment);
router.put('/:gifId/comment/:commentId/like', verifyToken, likeComment);
router.delete('/:gifId/comment/:commentId', verifyToken, deleteComment);

// 🗑️ Borrar GIF
router.delete('/:gifId', verifyToken, deleteGif);

// 💬 Obtener comentarios de un GIF
router.get('/:gifId/comments', getGifComments);

// 📄 Obtener GIF por ID (después de /feed y /explore)
router.get('/:gifId', getGifById);

// 📄 Obtener GIFs subidos por un usuario
router.get('/user/:userId', getGifsByUser);

// ❤️ Obtener GIFs que me gustaron
router.get('/liked/:userId', getLikedGifs);

// 💬 Obtener comentarios de un usuario
router.get('/comments/:userId', getCommentsByUser);

export default router;
