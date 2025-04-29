import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const funnyGifs = [
  'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
  'https://media.giphy.com/media/l0MYB8Ory7Hqefo9a/giphy.gif',
  'https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif',
  'https://media.giphy.com/media/1wX5JvVOzGKF4/giphy.gif',
  'https://media.giphy.com/media/3orieVVSG0bo3IVHmq/giphy.gif',
  'https://media.giphy.com/media/3o7aCTfyhYawdOXcFW/giphy.gif',
];

function NotFound() {
  const [currentGifs, setCurrentGifs] = useState<string[]>([]);

  useEffect(() => {
    generateRandomGifs();
    const interval = setInterval(generateRandomGifs, 30000); // Cada 30s
    return () => clearInterval(interval);
  }, []);

  const generateRandomGifs = () => {
    const shuffled = [...funnyGifs].sort(() => 0.5 - Math.random());
    setCurrentGifs(shuffled.slice(0, 6));
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background text-foreground dark:bg-[#422373] dark:text-[#AA90FB] p-4">
      <h1 className="z-10 mb-4 text-5xl font-bold">404 - Lost in the GIFs</h1>
      <p className="z-10 max-w-md mb-6 text-lg text-center">
        Oops! Looks like Homer's been here... 🍩
      </p>

      <Link
        to="/feed"
        className="z-10 px-6 py-3 mb-10 font-bold text-white transition bg-accent rounded-xl hover:bg-accent-dark"
      >
        Back to Safety
      </Link>

      {/* GIFs random que cambian cada 30s */}
      {currentGifs.map((gif, index) => (
        <img
          key={index}
          src={gif}
          alt="funny gif"
          className="absolute object-cover w-32 h-32 rounded-lg animate-bounce"
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default NotFound;
