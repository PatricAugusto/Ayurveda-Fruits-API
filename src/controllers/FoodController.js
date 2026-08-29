import { FoodService } from '../services/FoodService.js';

export class FoodController {
  static async create(req, res) {
    try {
      const food = await FoodService.create(req.body);
      return res.status(201).json(food);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { season, category } = req.query;
      const foods = await FoodService.findAll({ season, category });
      return res.status(200).json(foods);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const food = await FoodService.findById(req.params.id);
      if (!food) return res.status(404).json({ error: 'Alimento não encontrado' });
      return res.status(200).json(food);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const updated = await FoodService.update(req.params.id, req.body);
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await FoodService.delete(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}