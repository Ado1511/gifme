import express from 'express';
import { getNotifications, markAsRead, deleteNotification } from '../controllers/notificationController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// Obtener notificaciones del usuario logueado
router.get('/', verifyToken, getNotifications);

// Marcar notificación como leída
router.put('/:id/read', verifyToken, markAsRead);

// Eliminar una notificación
router.delete('/:id', verifyToken, deleteNotification);

export default router;
