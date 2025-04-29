import User from '../models/User.js';

// Obtener todos los usuarios
export const toggleFollow = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.userId;

    if (userId === targetId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!target) return res.status(404).json({ message: 'User not found' });

    const isFollowing = user.following.includes(targetId);

    if (isFollowing) {
      user.following.pull(targetId);
      target.followers.pull(userId);
    } else {
      user.following.push(targetId);
      target.followers.push(userId);
    }

    await user.save();
    await target.save();

    res.status(200).json({
      message: isFollowing ? 'Unfollowed user' : 'Followed user',
      following: user.following,
      followers: target.followers
    });
  } catch (error) {
    console.error('❌ Error following user:', error.message);
    res.status(500).json({ message: 'Error updating follow state' });
  }
};

// Obtener la lista de seguidores de un usuario
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('followers', 'username avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.followers);
  } catch (error) {
    console.error('❌ Error getting followers:', error.message);
    res.status(500).json({ message: 'Error fetching followers' });
  }
};

// Obtener la lista de usuarios a los que sigue un usuario
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('following', 'username avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.following);
  } catch (error) {
    console.error('❌ Error getting following:', error.message);
    res.status(500).json({ message: 'Error fetching following' });
  }
};

// Obtener un usuario por su nombre de usuario
export const getUserByUsername = async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.findOne({ username })
      .populate('followers', '_id username avatar')
      .populate('following', '_id username avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✨ Opcional: podés incluir sus GIFs si querés
    // const gifs = await Gif.find({ uploadedBy: user._id });

    res.status(200).json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      followers: user.followers,
      following: user.following,
      // gifs, // si usás esto, importá Gif arriba
    });
  } catch (error) {
    console.error('❌ Error getting user by username:', error.message);
    res.status(500).json({ message: 'Error fetching user data' });
  }
};
