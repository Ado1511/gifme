import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FollowButton from '../components/FollowButton';
import GifCard from '../components/gifCard'; 
import GifModal from '../components/GifModal';

interface Gif {
  _id: string;
  url: string;
  caption: string;
  uploadedBy?: {
    username: string;
    avatar?: string;
  };
  likes: string[];
  comments: number;
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
  const [selectedGif, setSelectedGif] = useState<Gif | null>(null);

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
      const res = await fetch(`http://localhost:5000/api/social/by-username/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const gifs = await gifsRes.json();
      setUserGifs(gifs.map((gif: any) => ({ ...gif, likes: gif.likes.map(String) })));
      setLikedGifs(await likedRes.json());
      setComments(await commentsRes.json());
    };
    fetchData();
  }, [profileUser]);

  const isOwnProfile = currentUser?.username === username;


  if (!profileUser) return <p className="mt-10 text-center">Loading profile...</p>;

  return (
    <div className="max-w-5xl p-4 mx-auto">
      <div className="flex flex-col items-center gap-4 text-center">
        <img
          src={profileUser.avatar || 'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif'}
          alt="Profile GIF"
          className="border-4 rounded-full shadow w-28 h-28 border-accent"
        />
        <h2 className="text-2xl font-bold">@{profileUser.username}</h2>
        {isOwnProfile ? (
          <button onClick={() => navigate('/settings')} className="px-4 py-2 text-white rounded bg-accent">
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
        <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
          <span>GIFs: {userGifs.length}</span>
          <span>Followers: {profileUser.followers?.length ?? 0}</span>
          <span>Following: {profileUser.following?.length ?? 0}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8 mb-6 border-b">
        {['gifs', 'liked', 'comments'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab ? 'text-accent border-b-2 border-accent' : 'text-gray-500'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'gifs' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {userGifs.map(gif => (
            <GifCard
              key={gif._id}
              gif={{ ...gif, comments: Array.isArray(gif.comments) ? gif.comments : [] }}
              onClick={() => setSelectedGif(gif)}
            />
          ))}
        </div>
      )}

      {activeTab === 'liked' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {likedGifs.map(gif => (
            <GifCard
              key={gif._id}
              gif={{ ...gif, comments: Array.isArray(gif.comments) ? gif.comments : [] }}
              onClick={() => setSelectedGif(gif)}
            />
          ))}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-4">
          {comments.map((comment, i) => (
            <div key={i} className="bg-white dark:bg-[#2a2a2a] p-4 rounded shadow">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={comment.gifUrl}
                  alt="GIF preview"
                  className="w-12 h-12 rounded"
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
      )}

      {selectedGif && (
        <GifModal
          gif={selectedGif}
          onClose={() => setSelectedGif(null)}
        />
      )}
    </div>
  );
}

export default Profile;
