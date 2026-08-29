import { Router } from 'express';
import { FoodController } from '../controllers/FoodController.js';

const router = Router();

router.post('/', FoodController.create);
router.get('/', FoodController.getAll);
router.get('/:id', FoodController.getById);
router.put('/:id', FoodController.update);
router.delete('/:id', FoodController.delete);

export default router;