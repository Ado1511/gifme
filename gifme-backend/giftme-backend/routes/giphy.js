import express from 'express';
import axios from 'axios';

const router = express.Router();

const GIPHY_API_KEY = 'UVLuM2teIs7rWQ5nrQAaP778k62AZ4LH';

router.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Missing search query parameter 'q'" });
  }

  try {
    const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
      params: {
        api_key: GIPHY_API_KEY,
        q: query,
        limit: 20,
      },
    });

    // Devuelve solo el array de GIFs
    res.status(200).json(response.data.data);
  } catch (error) {
    console.error('❌ Error searching Giphy:', error.message);
    res.status(500).json({ error: 'Failed to fetch GIFs from Giphy' });
  }
});

export default router;