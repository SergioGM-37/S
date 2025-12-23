
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzePlayerImage(base64Image: string): Promise<string> {
  const prompt = `
    Analiza esta imagen relacionada con fútbol. 
    Si es un jugador, identifica quién es, su equipo actual y una breve descripción de su rendimiento reciente o estadísticas clave en Biwenger/fantasy football.
    Si es una captura de pantalla de un equipo, analiza la formación y sugiere mejoras.
    Responde en un formato amigable para una aplicación de manager de fútbol.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image.split(',')[1] || base64Image
              }
            }
          ]
        }
      ],
      config: {
        thinkingConfig: { thinkingBudget: 10000 }
      }
    });

    return response.text || "No se pudo obtener un análisis claro de la imagen.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export async function extractRankingsFromImage(base64Image: string): Promise<{ name: string; points: number }[]> {
  const prompt = `
    Extrae los nombres de los equipos y sus puntos totales de esta captura de pantalla de una clasificación de liga.
    Ignora otros datos como partidos jugados, goles, etc. Solo quiero el nombre del equipo y los puntos totales.
    Asegúrate de capturar todos los equipos visibles.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image.split(',')[1] || base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rankings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  points: { type: Type.NUMBER }
                },
                required: ["name", "points"]
              }
            }
          },
          required: ["rankings"]
        }
      }
    });

    const json = JSON.parse(response.text || '{"rankings": []}');
    return json.rankings;
  } catch (error) {
    console.error("Gemini Ranking Extraction Error:", error);
    throw error;
  }
}
