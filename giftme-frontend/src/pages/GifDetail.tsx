import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

function GifDetail() {
  const { id } = useParams<{ id: string }>();
  const [gif, setGif] = useState<any>(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const gifRes = await fetch(`http://localhost:5000/api/gif/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const gifData = await gifRes.json();
        setGif(gifData);
        setLikes(gifData.likes.length);

        const userRes = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        setCurrentUser(userData);
        setLiked(gifData.likes.includes(userData._id));

        const commentsRes = await fetch(`http://localhost:5000/api/gif/${id}/comments`);
        const commentData = await commentsRes.json();
        setComments(commentData);
      } catch (err) {
        console.error('❌ Error fetching GIF:', err);
      }
    };

    if (id) fetchData();
  }, [id]);

  const toggleLike = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/gif/${id}/like`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setLiked(data.liked);
      setLikes(data.likesCount);
    } catch (err) {
      console.error('❌ Error toggling like:', err);
    }
  };

  const handleAddComment = async () => {
    const token = localStorage.getItem('token');
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/gif/${id}/comment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newComment }),
      });

      const data = await res.json();
      setComments((prev) => [data.comment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('❌ Error posting comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/gif/${id}/comment/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      console.error('❌ Error deleting comment:', err);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/gif/${id}/comment/${commentId}/like`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId ? { ...comment, likes: [...Array(data.likes).keys()] } : comment
        )
      );
    } catch (err) {
      console.error('❌ Error liking comment:', err);
    }
  };

  const topComment = comments.length > 0
    ? [...comments].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))[0]
    : null;

  const otherComments = topComment
    ? comments.filter((c) => c._id !== topComment._id)
    : [];

  return (
    <div className="max-w-2xl p-4 mx-auto">
      <h2 className="mb-4 text-2xl font-bold text-accent">GIF Details</h2>

      {gif && (
        <img src={gif.url} alt="GIF" className="w-full mb-4 rounded-lg" />
      )}

      {/* Like Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={toggleLike}
          className="flex items-center gap-2 transition hover:scale-110"
          title={liked ? "Unlike" : "Like"}
        >
          <img
            src="https://media.giphy.com/media/JUALABB2CfamXLTltj/giphy.gif"
            alt="Like"
            className={`w-6 h-6 ${!liked ? 'opacity-40 grayscale' : ''}`}
          />
          <span className="text-sm">{likes}</span>
        </button>
      </div>

      {/* Top Comment */}
      {topComment && (
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold">Top Comment</h3>
          <div className="bg-white dark:bg-[#2a2a2a] p-3 rounded shadow relative">
            <p className="text-sm font-medium">@{topComment.user?.username || 'anon'}</p>
            <p className="mt-1 text-sm">{topComment.text}</p>
            <p className="mt-1 text-xs text-gray-400">{topComment.likes?.length || 0} likes</p>
            <button
              onClick={() => handleLikeComment(topComment._id)}
              className="mt-1 text-xs text-pink-500 hover:underline"
            >
              ❤️ Like
            </button>
            {topComment.user?._id === currentUser?._id && (
              <button
                onClick={() => handleDeleteComment(topComment._id)}
                className="absolute text-xs text-red-500 top-2 right-2 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Other Comments */}
      {otherComments.length > 0 && (
        <>
          <button
            onClick={() => setShowAll(!showAll)}
            className="mb-2 text-sm text-accent"
          >
            {showAll ? 'Hide comments' : 'Show all comments'}
          </button>

          {showAll && (
            <div className="flex flex-col gap-3">
              {otherComments.map((comment) => (
                <div key={comment._id} className="bg-white dark:bg-[#2a2a2a] p-3 rounded shadow relative">
                  <p className="text-sm font-medium">@{comment.user?.username || 'anon'}</p>
                  <p className="mt-1 text-sm">{comment.text}</p>
                  <p className="mt-1 text-xs text-gray-400">{comment.likes?.length || 0} likes</p>
                  <button
                    onClick={() => handleLikeComment(comment._id)}
                    className="mt-1 text-xs text-pink-500 hover:underline"
                  >
                    ❤️ Like
                  </button>
                  {comment.user?._id === currentUser?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="absolute text-xs text-red-500 top-2 right-2 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Comment Form */}
      <div className="mt-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-2 border dark:border-gray-600 dark:bg-[#2a2a2a] rounded resize-none"
          rows={2}
        />
        <button
          onClick={handleAddComment}
          className="px-4 py-2 mt-2 text-white transition rounded bg-accent hover:opacity-90"
        >
          Post Comment
        </button>
      </div>
    </div>
  );
}

export default GifDetail;
