import { useState } from 'react';
import GifModal from './GifModal';

interface Gif {
  _id: string;
  url: string;
  caption: string;
  likes: string[]; // IDs de usuarios
  comments: { text: string }[];
  uploadedBy?: {
    username: string;
    avatar?: string;
  };
}

interface GifCardProps {
  gif: Gif;
  onClick?: () => void;
}

function GifCard({ gif, onClick }: GifCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [likes, setLikes] = useState(gif.likes || []);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Previene abrir el modal

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
        if (data.liked) {
          setLikes((prev) => [...prev, 'temp']); // Puedes usar el ID del usuario si lo tienes
        } else {
          setLikes((prev) => prev.slice(0, -1)); // Elimina el último temporalmente
        }
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error);
    }
  };

  return (
    <div
      className="relative rounded-2xl bg-white/80 dark:bg-[#422373]/50 shadow-xl border border-gray-200 dark:border-[#5e3aa6] backdrop-blur-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
      onClick={onClick || (() => setIsOpen(true))}
    >
      <img
        src={gif.url}
        alt={gif.caption}
        className="object-cover w-full h-48 rounded-t-2xl"
      />
      <div className="p-3 text-foreground dark:text-[#AA90FB]">
        <p className="text-sm font-medium truncate">{gif.caption}</p>
        <div className="flex items-center gap-3 mt-2">
          <button onClick={handleLike}>
            <img
              src="https://media.giphy.com/media/3o7aCS4Z3YdtgUvYs0/giphy.gif"
              alt="like"
              className="w-5 h-5"
            />
          </button>
          <span className="text-sm">{likes.length}</span>
          <img
            src="https://media.giphy.com/media/3o7aCQ8mfzu4ltK0lG/giphy.gif"
            alt="comment"
            className="w-5 h-5 ml-4"
          />
          <span className="text-sm">{gif.comments?.length || 0}</span>
        </div>
      </div>
      {isOpen && <GifModal gif={gif} onClose={() => setIsOpen(false)} />}
    </div>
  );
}

export default GifCard;
