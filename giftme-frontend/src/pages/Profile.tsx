import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FollowButton from '../components/FollowButton';

interface Gif {
  _id: string;
  url: string;
  caption: string;
}

interface CommentData {
  gifId: string;
  gifUrl: string;
  gifCaption: string;
  gifOwner: string;
  commentText: string;
  createdAt: string;
}

interface User {
  _id: string;
  username: string;
  avatar: string;
  followers: { _id: string }[];
  following: { _id: string }[];
}

function Profile() {
  const { username } = useParams<{ username: string }>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userGifs, setUserGifs] = useState<Gif[]>([]);
  const [likedGifs, setLikedGifs] = useState<Gif[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'gifs' | 'liked' | 'comments'>('gifs');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCurrentUser(data);
    };

    fetchMe();
  }, [token]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username || !token) return;

      try {
        const res = await fetch(`http://localhost:5000/api/social/by-username/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error('❌ Error fetching profile:', await res.text());
          return;
        }

        const data = await res.json();
        setProfileUser({
          ...data,
          followers: data.followers || [],
          following: data.following || [],
        });

        if (currentUser) {
          const isFollowing = data.followers?.some((f: any) => f._id === currentUser._id);
          setIsFollowing(isFollowing);
        }
      } catch (err) {
        console.error('❌ Error fetching profile:', err);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [username, currentUser, token]);

  useEffect(() => {
    const fetchData = async () => {
      if (!profileUser) return;

      const [gifsRes, likedRes, commentsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/gif/user/${profileUser._id}`),
        fetch(`http://localhost:5000/api/gif/liked/${profileUser._id}`),
        fetch(`http://localhost:5000/api/gif/comments/${profileUser._id}`),
      ]);

      setUserGifs(await gifsRes.json());
      setLikedGifs(await likedRes.json());
      setComments(await commentsRes.json());
    };

    fetchData();
  }, [profileUser]);

  const isOwnProfile = currentUser?.username === username;

  const handleDeleteGif = async (gifId: string) => {
    if (!window.confirm('Are you sure you want to delete this GIF?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/gif/${gifId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUserGifs((prev) => prev.filter((g) => g._id !== gifId));
        alert('GIF deleted successfully');
      } else {
        alert(data.message || 'Failed to delete GIF');
      }
    } catch (err) {
      console.error('Error deleting GIF:', err);
      alert('Error deleting GIF');
    }
  };

  if (!profileUser) return <p className="mt-10 text-center">Loading profile...</p>;

  return (
    <div className="max-w-4xl p-4 mx-auto">
      <div className="flex flex-col items-center gap-4 text-center">
        <img
          src={profileUser.avatar || 'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif'}
          alt="Profile GIF"
          className="transition-transform border-4 rounded-full shadow-lg w-28 h-28 border-accent hover:scale-105"
        />
        <h2 className="text-2xl font-bold">@{profileUser.username}</h2>

        {isOwnProfile ? (
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2 text-white transition rounded bg-accent hover:opacity-90"
          >
            Edit Profile
          </button>
        ) : (
          currentUser && (
            <FollowButton
              targetUserId={profileUser._id}
              isFollowing={isFollowing}
              onToggle={setIsFollowing}
            />
          )
        )}

        <div className="flex gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span>GIFs: {userGifs.length}</span>
          <span>Followers: {profileUser.followers?.length ?? 0}</span>
          <span>Following: {profileUser.following?.length ?? 0}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mt-8 mb-6 border-b border-gray-300 dark:border-gray-600">
        {['gifs', 'liked', 'comments'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`py-2 px-4 font-medium transition ${
              activeTab === tab ? 'border-b-2 border-accent text-accent' : 'text-gray-500'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'gifs' && (
        userGifs.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {userGifs.map((gif) => (
              <div
                key={gif._id}
                className="relative group bg-white dark:bg-[#2a2a2a] rounded shadow overflow-hidden"
              >
                <img src={gif.url} alt={gif.caption} className="w-full h-auto" />
                {isOwnProfile && (
                  <button
                    onClick={() => handleDeleteGif(gif._id)}
                    className="absolute w-6 h-6 text-xs font-bold text-white transition bg-red-500 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100"
                    title="Delete GIF"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">No GIFs yet.</p>
        )
      )}

      {activeTab === 'liked' && (
        likedGifs.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {likedGifs.map((gif) => (
              <div key={gif._id} className="bg-white dark:bg-[#2a2a2a] rounded shadow overflow-hidden">
                <img src={gif.url} alt={gif.caption} className="w-full h-auto" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">No liked GIFs yet.</p>
        )
      )}

      {activeTab === 'comments' && (
        comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment, i) => (
              <div key={i} className="bg-white dark:bg-[#2a2a2a] p-4 rounded shadow">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={comment.gifUrl}
                    alt="GIF preview"
                    className="object-cover w-12 h-12 border rounded"
                  />
                  <div>
                    <p className="text-sm">
                      On <strong>@{comment.gifOwner}</strong>'s GIF
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm">{comment.commentText}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">No comments yet.</p>
        )
      )}
    </div>
  );
}

export default Profile;
