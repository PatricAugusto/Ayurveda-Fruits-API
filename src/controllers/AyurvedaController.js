import { LlmService } from '../services/LlmService.js';

export class AyurvedaController {
  static async getRecommendations(req, res) {
    try {
      const { season, dosha } = req.query;

      if (!season || !dosha) {
        return res.status(400).json({ error: 'Os parâmetros "season" e "dosha" são obrigatórios' });
      }

      const result = await LlmService.getAyurvedicSeasonalFoods(season, dosha);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}