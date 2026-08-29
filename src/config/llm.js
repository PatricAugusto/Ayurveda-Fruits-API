import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export class LlmService {
  static async getAyurvedicSeasonalFoods(season, dosha) {
    const prompt = `
      Atue como um especialista em Medicina Ayurveda.
      Liste 5 frutas e 5 legumes da estação "${season}" que ajudam a equilibrar o Dosha "${dosha}".
      Retorne a resposta estritamente no formato JSON estruturado com os seguintes campos por item:
      "name", "category" (FRUIT ou VEGETABLE), "reason" (explicação breve segundo a ayurveda).
      Não inclua texto introdutório ou explicativo fora do JSON.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    return JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');
  }
}