import Notification from '../models/notification.js';


export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user.id })
      .populate('sender', 'username avatar')
      .populate('gif', 'url')
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ Error getting notifications:', error.message);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};


export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (notification.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error.message);
    res.status(500).json({ message: 'Error marking as read' });
  }
};


export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (notification.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await notification.remove();
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('❌ Error deleting notification:', error.message);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};
