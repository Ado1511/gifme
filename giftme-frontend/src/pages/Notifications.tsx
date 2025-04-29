import { useEffect, useState } from 'react';
import { useAuth } from '../Hooks/useAuth';

interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  gif?: {
    url: string;
  };
  sender?: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('❌ Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('❌ Error deleting notification:', err);
    }
  };

  const renderGifIcon = (type: string) => {
    switch (type) {
      case 'like':
        return 'https://media.giphy.com/media/JUALABB2CfamXLTltj/giphy.gif';
      case 'comment':
        return 'https://media.giphy.com/media/xT9IgIc0lryrxvqVGM/giphy.gif';
      case 'follow':
        return 'https://media.giphy.com/media/3orieULMwYkCz7g7v6/giphy.gif';
      default:
        return 'https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif';
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  return (
    <div className="max-w-3xl p-4 mx-auto">
      <h2 className="mb-6 text-3xl font-bold text-accent">
        {user?.username ? `Hello @${user.username}, here are your notifications 📬` : 'Notifications'}
      </h2>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <img src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" alt="Loading..." className="w-16 h-16" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-center text-gray-500">You have no notifications yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`p-4 rounded shadow border ${
                n.read ? 'opacity-60 dark:bg-[#1f1f1f]' : 'bg-white dark:bg-[#2a2a2a]'
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={renderGifIcon(n.type)}
                  alt={n.type}
                  className="w-8 h-8 rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">@{n.sender?.username || 'Unknown'}</p>
                  <p className="text-sm">{n.message}</p>
                  {n.gif && (
                    <img
                      src={n.gif.url || 'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif'}
                      alt="related gif"
                      className="w-32 h-auto mt-2 rounded"
                    />
                  )}
                  <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>

                  <div className="flex gap-4 mt-2 text-xs">
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="text-blue-600 hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n._id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
