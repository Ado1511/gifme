import { useEffect, useState } from 'react';
import { useAuth } from '../Hooks/useAuth';
import { Link } from 'react-router-dom';
import { DecodedToken } from '../Hooks/useAuth';
import toast from 'react-hot-toast';

interface Gif {
  _id: string;
  url: string;
  caption: string;
  uploadedBy: {
    _id: string;
    username: string;
    avatar?: string;
  };
  likes: string[];
  comments: {
    _id: string;
    user: {
      username: string;
      avatar?: string;
    };
    text: string;
  }[];
}

function Feed() {
  const { user }: { user: DecodedToken | null; logout: () => void } = useAuth();
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<{ [gifId: string]: string }>({});
  const [showCommentBox, setShowCommentBox] = useState<{ [gifId: string]: boolean }>({});

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const res = await fetch('http://localhost:5000/api/gif/feed', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to load feed');
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setGifs(data);
        } else {
          setGifs([]);
        }
      } catch (error: any) {
        console.error('❌ Error fetching feed:', error);
        toast.error(error.message || 'Failed to load feed');
        setGifs([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchFeed();
  }, [user]);

  const handleLike = async (gifId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/gif/${gifId}/like`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setGifs(prev =>
          prev.map(gif =>
            gif._id === gifId
              ? {
                  ...gif,
                  likes: data.liked
                    ? [...gif.likes, user ? user._id : '']
                    : gif.likes.filter(id => id !== (user?._id || '')),
                }
              : gif
          )
        );
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error);
    }
  };

  const handleToggleCommentBox = (gifId: string) => {
    setShowCommentBox(prev => ({ ...prev, [gifId]: !prev[gifId] }));
  };

  const handleCommentChange = (gifId: string, text: string) => {
    setCommentText(prev => ({ ...prev, [gifId]: text }));
  };

  const submitComment = async (gifId: string) => {
    try {
      const token = localStorage.getItem('token');
      const text = commentText[gifId];
      if (!text.trim()) return;

      const res = await fetch(`http://localhost:5000/api/gif/${gifId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (res.ok && data.comment) {
        setGifs(prev =>
          prev.map(gif =>
            gif._id === gifId
              ? { ...gif, comments: [...gif.comments, data.comment] }
              : gif
          )
        );
        setCommentText(prev => ({ ...prev, [gifId]: '' }));
      } else {
        console.error('❌ Error from server:', data.message);
      }
    } catch (error) {
      console.error('❌ Error submitting comment:', error);
    }
  };

  return (
    <div className="max-w-2xl px-4 py-6 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-accent">Your Feed 📰</h1>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <img
            src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif"
            alt="Loading"
            className="w-16 h-16"
          />
        </div>
      ) : gifs.length > 0 ? (
        <div className="flex flex-col gap-6">
          {gifs.map(gif => (
            <div
              key={gif._id}
              className="rounded-2xl bg-white dark:bg-[#2a2a2a] shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden border border-gray-100 dark:border-[#3b3b3b]"
            >
              <Link to={`/gif/${gif._id}`}>
                <img
                  src={gif.url}
                  alt={gif.caption}
                  className="object-cover w-full max-h-[400px]"
                />
              </Link>
              <div className="p-4">
                <p className="text-sm font-semibold text-foreground dark:text-white">{gif.caption}</p>
                <Link to={`/profile/${gif.uploadedBy.username}`} className="flex items-center gap-2 mt-2">
                  <img
                    src={gif.uploadedBy.avatar || 'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif'}
                    alt={gif.uploadedBy.username}
                    className="w-8 h-8 border rounded-full"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-300">@{gif.uploadedBy.username}</span>
                </Link>

                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => handleLike(gif._id)}
                    className="transition-transform transform hover:scale-110 hover:shadow-lg"
                  >
                    <img
                      src="https://media.giphy.com/media/3o7aCS4Z3YdtgUvYs0/giphy.gif"
                      alt="Like"
                      className="object-cover w-8 h-8 rounded-full"
                    />
                    <p className="text-xs text-center">{gif.likes.length} likes</p>
                  </button>

                  <button
                    onClick={() => handleToggleCommentBox(gif._id)}
                    className="transition-transform transform hover:scale-110 hover:shadow-lg"
                  >
                    <img
                      src="https://media.giphy.com/media/3o7aCQ8mfzu4ltK0lG/giphy.gif"
                      alt="Comment"
                      className="object-cover w-8 h-8 rounded-full"
                    />
                  </button>
                </div>

                {showCommentBox[gif._id] && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText[gif._id] || ''}
                      onChange={e => handleCommentChange(gif._id, e.target.value)}
                      className="w-full px-3 py-2 mt-2 text-sm rounded-lg border dark:border-gray-600 dark:bg-[#1f1f1f] focus:outline-none"
                    />
                    <button
                      onClick={() => submitComment(gif._id)}
                      className="px-3 py-1 mt-2 text-xs font-bold text-white transition rounded bg-accent hover:bg-accent-dark"
                    >
                      Send
                    </button>
                  </div>
                )}

                {gif.comments.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-300">Recent Comments:</p>
                    {gif.comments.slice(-2).map(comment => (
                      <div key={comment._id} className="flex items-center gap-2 mb-2">
                        <img
                          src={comment.user.avatar || 'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif'}
                          alt={comment.user.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <p className="text-xs text-foreground dark:text-white">
                          <span className="font-bold">@{comment.user.username}</span>: {comment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No content yet. Follow users to see their GIFs!</p>
      )}
    </div>
  );
}

export default Feed;