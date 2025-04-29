import { useState } from 'react';

function Home() {
  const [likes, setLikes] = useState<{ [postId: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [postId: number]: number }>({
    1: 132,
    2: 98,
  });

  const posts = [
    {
      id: 1,
      username: 'ado',
      gif: 'https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif',
      caption: 'Feeling cute today ✨',
    },
    {
      id: 2,
      username: 'gif_queen',
      gif: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
      caption: 'This is so me lol',
    },
  ];

  const toggleLike = (postId: number) => {
    const isLiked = likes[postId];
    setLikes((prev) => ({ ...prev, [postId]: !isLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: isLiked ? prev[postId] - 1 : prev[postId] + 1,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-accent mb-6">Feed</h2>

      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-[#2a2a2a] rounded-lg shadow overflow-hidden"
          >
            <div className="p-4 flex justify-between items-center">
              <span className="font-semibold text-foreground dark:text-white">@{post.username}</span>
            </div>
            <img src={post.gif} alt={post.caption} className="w-full h-auto" />
            <div className="p-4 text-sm text-gray-700 dark:text-gray-300">{post.caption}</div>

            <div className="px-4 pb-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <button
                onClick={() => toggleLike(post.id)}
                className="flex items-center gap-1 hover:text-accent transition"
              >
                {likes[post.id] ? (
                  <img
                    src="https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif"
                    alt="Liked"
                    className="w-6 h-6"
                  />
                ) : (
                  <span>Like</span>
                )}
                <span>{likeCounts[post.id]}</span>
              </button>

              <button className="hover:text-accent transition">Comment</button>
              <button className="hover:text-accent transition">Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
