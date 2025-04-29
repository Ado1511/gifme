import express from 'express';
import { searchEverything } from '../controllers/searchController.js';
const router = express.Router();

router.get('/', searchEverything);

export default router;


