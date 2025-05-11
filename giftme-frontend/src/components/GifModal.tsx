import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface Comment {
  _id: string;
  text: string;
  user: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

interface Gif {
  _id: string;
  url: string;
  caption: string;
  likes?: string[]; // importante si quieres contar likes
  uploadedBy?: {
    username: string;
    avatar?: string;
  };
}

interface GifModalProps {
  gif: Gif | null;
  onClose: () => void;
}

function GifModal({ gif, onClose }: GifModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState<string[]>(gif?.likes || []);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchComments = async () => {
      if (!gif?._id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/gif/${gif._id}/comments`);
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading comments:', err);
      }
    };
    fetchComments();
  }, [gif?._id]);

  const handleLike = async () => {
    if (!gif?._id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/gif/${gif._id}/like`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setLikes((prev) =>
          data.liked ? [...prev, 'temp'] : prev.slice(0, -1)
        );
      } else {
        toast.error('Error toggling like');
      }
    } catch (error) {
      toast.error('Error toggling like');
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !gif?._id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/gif/${gif._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment('');
      } else {
        toast.error(data.message || 'Failed to post comment');
      }
    } catch (error) {
      toast.error('Error posting comment');
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!gif?._id) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div ref={modalRef} className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow-lg w-full max-w-2xl p-4 relative">
        <button
          onClick={onClose}
          className="absolute text-xl text-white top-4 right-4 hover:text-red-500"
        >
          &times;
        </button>
        <img src={gif.url} alt={gif.caption} className="w-full mb-4 rounded" />
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-foreground dark:text-[#AA90FB]">{gif.caption}</h2>
          <div className="flex items-center gap-3">
            <button onClick={handleLike}>
              <img
                src="https://media.giphy.com/media/3o7aCS4Z3YdtgUvYs0/giphy.gif"
                alt="like"
                className="w-6 h-6"
              />
            </button>
            <span>{likes.length}</span>
            <img
              src="https://media.giphy.com/media/3o7aCQ8mfzu4ltK0lG/giphy.gif"
              alt="comment"
              className="w-6 h-6"
            />
            <span>{comments.length}</span>
          </div>
        </div>

        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 text-sm border rounded dark:border-gray-600 dark:bg-[#2a2a2a]"
          />
          <button
            onClick={handleCommentSubmit}
            className="px-4 py-2 mt-2 text-sm text-white rounded bg-accent hover:opacity-90"
          >
            Post Comment
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-60">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="p-2 bg-gray-100 dark:bg-[#3b3b3b] rounded">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={comment.user.avatar || 'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif'}
                    alt="avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium">@{comment.user.username}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default GifModal;
