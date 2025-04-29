import { useState } from 'react';

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
  onToggle?: (newState: boolean) => void;
}

const FollowButton = ({ targetUserId, isFollowing, onToggle }: FollowButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(isFollowing);

  const handleToggleFollow = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`http://localhost:5000/api/social/follow/${targetUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setFollowing(!following);
        onToggle && onToggle(!following);
      } else {
        console.error('Failed to toggle follow');
      }
    } catch (error) {
      console.error('❌ Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded font-semibold ${
        following ? 'bg-gray-500 text-white' : 'bg-accent text-white'
      } hover:opacity-90 transition`}
    >
      {loading ? '...' : following ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;