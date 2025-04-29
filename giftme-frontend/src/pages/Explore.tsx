import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';

interface Gif {
  _id?: string;
  url: string;
  caption: string;
  uploadedBy?: {
    username: string;
    avatar?: string;
  };
}

function Explore() {
  const { user } = useAuth();
  const location = useLocation();
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'recent' | 'popular'>('recent');

  const query = new URLSearchParams(location.search).get('q');

  const fetchExploreGifs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/gif/explore?filter=${filter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }

      const data = await res.json();
      setGifs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error fetching explore gifs:', error);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGiphyGifs = async (searchQuery: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/giphy/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      const gifsFromGiphy = Array.isArray(data.data)
        ? data.data.map((gif: any) => ({
            url: gif.images?.original?.url || 'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif',
            caption: gif.title || 'No title',
          }))
        : [];
      setGifs(gifsFromGiphy);
    } catch (error) {
      console.error('❌ Error fetching Giphy gifs:', error);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (query) {
      fetchGiphyGifs(query);
    } else if (user) {
      fetchExploreGifs();
    }
  }, [user, filter, query]);

  return (
    <div className="max-w-6xl px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-accent">
        {query ? `Results for "${query}"` : 'Explore 🔎'}
      </h1>

      {!query && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 rounded-xl font-semibold ${
              filter === 'recent'
                ? 'bg-accent text-white'
                : 'bg-gray-200 dark:bg-[#3b3b3b] text-foreground dark:text-[#AA90FB]'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`px-4 py-2 rounded-xl font-semibold ${
              filter === 'popular'
                ? 'bg-accent text-white'
                : 'bg-gray-200 dark:bg-[#3b3b3b] text-foreground dark:text-[#AA90FB]'
            }`}
          >
            Popular
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <img
            src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif"
            alt="Loading..."
            className="w-16 h-16"
          />
        </div>
      ) : gifs.length === 0 ? (
        <p className="text-center text-gray-500">No GIFs found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {gifs.map((gif, index) => (
            <div
              key={gif._id || index}
              className="rounded-2xl bg-white/80 dark:bg-[#422373]/50 shadow-xl border border-gray-200 dark:border-[#5e3aa6]
                backdrop-blur-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <img
                src={gif.url}
                alt={gif.caption}
                className="object-cover w-full h-48 rounded-t-2xl"
              />
              <div className="p-4 text-foreground dark:text-[#AA90FB]">
                <p className="text-sm font-medium truncate">{gif.caption}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Explore;
