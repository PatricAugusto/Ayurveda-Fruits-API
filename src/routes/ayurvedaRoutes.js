import { Router } from 'express';
import { AyurvedaController } from '../controllers/AyurvedaController.js';

const router = Router();

router.get('/recommendations', AyurvedaController.getRecommendations);

export default router;