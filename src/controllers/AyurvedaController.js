import { LlmService } from '../services/LlmService.js';

export class AyurvedaController {
  static async getRecommendations(req, res) {
    try {
      const { season, dosha } = req.query;
      if (!season || !dosha) {
        return res.status(400).json({ error: 'Parâmetros "season" e "dosha" são obrigatórios' });
      }

      const recommendations = await LlmService.getAyurvedicSeasonalFoods(season, dosha);
      return res.status(200).json(recommendations);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}