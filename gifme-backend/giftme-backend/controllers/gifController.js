import Gif from '../models/gif.js';
import User from '../models/User.js';

// 📤 Subir GIF por URL
export const uploadGif = async (req, res) => {
  try {
    const { url, caption } = req.body;

    const newGif = new Gif({
      url,
      caption,
      uploadedBy: req.user.id,
    });

    await newGif.save();
    res.status(201).json({ message: 'GIF uploaded successfully', gif: newGif });
  } catch (error) {
    console.error('❌ Error uploading GIF:', error.message);
    res.status(500).json({ message: 'Server error uploading GIF' });
  }
};

// 📤 Subir GIF como archivo
export const uploadGifFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const url = `${req.protocol}://${req.get('host')}/uploads/gifs/${req.file.filename}`;
    const { caption } = req.body;

    const newGif = new Gif({
      url,
      caption,
      uploadedBy: req.user.id,
    });

    await newGif.save();
    res.status(201).json({ message: 'GIF uploaded successfully', gif: newGif });
  } catch (error) {
    console.error('❌ Error uploading file:', error.message);
    res.status(500).json({ message: 'Upload failed' });
  }
};

// 📄 Obtener todos los GIFs
export const getAllGifs = async (req, res) => {
  try {
    const gifs = await Gif.find()
      .populate('uploadedBy', 'username avatar')
      .sort({ createdAt: -1 });
    res.status(200).json(gifs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching GIFs' });
  }
};

// 📄 Obtener GIFs de un usuario
export const getGifsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const gifs = await Gif.find({ uploadedBy: userId })
      .populate('uploadedBy', 'username avatar')
      .sort({ createdAt: -1 });
    res.status(200).json(gifs);
  } catch (error) {
    console.error('❌ Error fetching user GIFs:', error.message);
    res.status(500).json({ message: 'Error fetching user GIFs' });
  }
};

// 📄 Obtener GIF por ID
export const getGifById = async (req, res) => {
  try {
    const { gifId } = req.params;
    if (!gifId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid GIF ID format' });
    }

    const gif = await Gif.findById(gifId).populate('uploadedBy', 'username avatar');
    if (!gif) return res.status(404).json({ message: 'GIF not found' });

    res.status(200).json(gif);
  } catch (error) {
    console.error('❌ Error fetching GIF by ID:', error.message);
    res.status(500).json({ message: 'Error fetching GIF' });
  }
};

// ❤️ Like / Unlike un GIF
export const toggleLike = async (req, res) => {
  try {
    const { gifId } = req.params;
    const userId = req.user.id;

    const gif = await Gif.findById(gifId);
    if (!gif) return res.status(404).json({ message: 'GIF not found' });

    const alreadyLiked = gif.likes.includes(userId);
    if (alreadyLiked) {
      gif.likes.pull(userId);
    } else {
      gif.likes.push(userId);
    }

    await gif.save();
    res.status(200).json({ liked: !alreadyLiked, likesCount: gif.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like' });
  }
};

// 💬 Comentar en un GIF
export const addComment = async (req, res) => {
  try {
    const { gifId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const gif = await Gif.findById(gifId);
    if (!gif) return res.status(404).json({ message: 'GIF not found' });

    const comment = { user: userId, text };
    gif.comments.push(comment);
    await gif.save();

    const newComment = gif.comments[gif.comments.length - 1];
    await newComment.populate('user', 'username avatar');

    res.status(201).json({ message: 'Comment added', comment: newComment });
  } catch (error) {
    console.error('❌ Error adding comment:', error.message);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

// 💬 Obtener comentarios de un GIF
export const getGifComments = async (req, res) => {
  try {
    const { gifId } = req.params;

    const gif = await Gif.findById(gifId).populate('comments.user', 'username avatar');
    if (!gif) return res.status(404).json({ message: 'GIF not found' });

    res.status(200).json(gif.comments);
  } catch (error) {
    console.error('❌ Error fetching comments:', error.message);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// 📰 Obtener GIFs de usuarios que sigo (Feed)
export const getFeedGifs = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('following');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const gifs = await Gif.find({ uploadedBy: { $in: user.following } })
      .populate('uploadedBy', 'username avatar')
      .sort({ createdAt: -1 });
    res.status(200).json(gifs);
  } catch (error) {
    console.error('❌ Error fetching feed:', error.message);
    res.status(500).json({ message: 'Error fetching feed' });
  }
};

// 🌎 Obtener GIFs para "Explorar"
export const getExploreGifs = async (req, res) => {
  try {
    const filter = req.query.filter || 'recent';
    let gifs;

    if (filter === 'popular') {
      gifs = await Gif.find()
        .populate('uploadedBy', 'username avatar')
        .sort({ likes: -1 })
        .limit(50);
    } else {
      gifs = await Gif.find()
        .populate('uploadedBy', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(50);
    }

    res.status(200).json(gifs);
  } catch (error) {
    console.error('❌ Error fetching explore GIFs:', error.message);
    res.status(500).json({ message: 'Server error fetching explore GIFs' });
  }
};

// ❤️ Obtener GIFs que me gustaron
export const getLikedGifs = async (req, res) => {
  try {
    const { userId } = req.params;

    const gifs = await Gif.find({ likes: userId })
      .populate('uploadedBy', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(gifs);
  } catch (error) {
    console.error('❌ Error fetching liked GIFs:', error.message);
    res.status(500).json({ message: 'Error fetching liked GIFs' });
  }
};

// 💬 Obtener mis comentarios
export const getCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const gifs = await Gif.find({ 'comments.user': userId })
      .select('url caption comments uploadedBy')
      .populate('comments.user', 'username avatar')
      .populate('uploadedBy', 'username');

    const userComments = gifs.flatMap((gif) =>
      gif.comments
        .filter((comment) => comment.user._id.toString() === userId)
        .map((comment) => ({
          gifId: gif._id,
          gifUrl: gif.url,
          gifCaption: gif.caption,
          gifOwner: gif.uploadedBy.username,
          commentText: comment.text,
          createdAt: comment.createdAt,
        }))
    );

    res.status(200).json(userComments);
  } catch (error) {
    console.error('❌ Error fetching user comments:', error.message);
    res.status(500).json({ message: 'Error fetching user comments' });
  }
};

// 🗑️ Borrar comentario propio
export const deleteComment = async (req, res) => {
  try {
    const { gifId, commentId } = req.params;

    const gif = await Gif.findById(gifId);
    if (!gif) return res.status(404).json({ message: 'GIF not found' });

    const comment = gif.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await gif.save();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting comment:', error.message);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

// 🗑️ Borrar GIF (propio o admin)
export const deleteGif = async (req, res) => {
  try {
    const { gifId } = req.params;

    const gif = await Gif.findById(gifId);
    if (!gif) return res.status(404).json({ message: 'GIF not found' });

    const isOwner = gif.uploadedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this GIF' });
    }

    await gif.remove();
    res.status(200).json({ message: 'GIF deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting GIF:', error.message);
    res.status(500).json({ message: 'Error deleting GIF' });
  }
};

// ❤️ Like / Unlike comentario
export const likeComment = async (req, res) => {
  try {
    const { gifId, commentId } = req.params;
    const userId = req.user.id;

    const gif = await Gif.findById(gifId);
    if (!gif) return res.status(404).json({ message: 'GIF not found' });

    const comment = gif.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const alreadyLiked = comment.likes.includes(userId);
    if (alreadyLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await gif.save();
    res.status(200).json({ message: alreadyLiked ? 'Comment unliked' : 'Comment liked', likes: comment.likes.length });
  } catch (error) {
    console.error('❌ Error liking comment:', error.message);
    res.status(500).json({ message: 'Error liking comment' });
  }
};
