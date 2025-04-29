import User from '../models/User.js';
import Gif from '../models/gif.js';

export const searchEverything = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Buscar usuarios por username (insensible a mayúsculas)
    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    }).select('username avatar');

    // Buscar GIFs por caption
    const gifs = await Gif.find({
      caption: { $regex: query, $options: 'i' }
    }).populate('uploadedBy', 'username avatar');

    res.status(200).json({ users, gifs });
  } catch (error) {
    console.error('❌ Error in search:', error.message);
    res.status(500).json({ message: 'Error performing search' });
  }
};
