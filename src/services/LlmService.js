import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PREFERRED_MODELS = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-specdec',
  'gemma2-9b-it',
  'llama3-70b-8192'
];

export class LlmService {
  static async getAvailableModel() {
    try {
      const modelsList = await groq.models.list();
      const activeModelIds = modelsList.data.map((m) => m.id);

      const matchedModel = PREFERRED_MODELS.find((model) =>
        activeModelIds.includes(model)
      );

      return matchedModel || activeModelIds[0];
    } catch (error) {
      console.warn('[Groq API] Não foi possível listar modelos automaticamente. Usando fallback fixo.');
      return 'llama-3.1-8b-instant';
    }
  }

  static async getAyurvedicSeasonalFoods(season, dosha) {
    const prompt = `
      Atue como um especialista em Medicina Ayurveda.
      Liste 5 frutas e 5 legumes da estação "${season}" que ajudam a equilibrar o Dosha "${dosha}".
      Retorne a resposta estritamente no formato JSON estruturado com a chave principal "recommendations" contendo uma lista de objetos com os campos:
      "name", "category" (FRUIT ou VEGETABLE), "reason".
      Não adicione nenhum texto introdutório ou marcação markdown fora do objeto JSON.
    `;

    const modelToUse = await this.getAvailableModel();
    console.log(`[Groq API] Utilizando o modelo ativo: ${modelToUse}`);

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: modelToUse,
        response_format: { type: 'json_object' }
      });

      const content = chatCompletion.choices[0]?.message?.content;
      return JSON.parse(content || '{"recommendations":[]}');
    } catch (error) {
      throw new Error(`Erro na geração de recomendações (${modelToUse}): ${error.message}`);
    }
  }
}