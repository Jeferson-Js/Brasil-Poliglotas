
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Always use process.env.API_KEY directly for client initialization
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a full structured lesson following core methodologies.
 * NOW UPDATED: Generates 50 exercises for maximum student fixation.
 */
export const generateLessonContent = async (language: string, level: string, topic: string, userContext?: string) => {
  const ai = getAI();
  const isSecretOfNine = topic.toLowerCase().includes('segredo dos nove') || topic.toLowerCase().includes('números');
  const isDaysOfWeek = topic.toLowerCase().includes('semana') || topic.toLowerCase().includes('tempo') || topic.toLowerCase().includes('dias');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Você é um Grão-Mestre Poliglota e Pedagogo de Elite. Gere uma lição de ${language} (${level}) sobre "${topic}".
    
    ESTRATÉGIA DE SUPER-FIXAÇÃO BRASIL POLIGLOTAS:
    - Gere EXATAMENTE 50 exercícios curtos. A repetição é a base da maestria.
    - Varie os contextos para que o aluno não apenas decore, mas absorva o padrão.
    
    DIRETRIZES POR IDIOMA:
    - Hindi: Use Devanagari e forneça a transliteração fonética.
    - Hebrew/Yiddish: Forneça a escrita original e a pronúncia.
    - British English: Enfatize o vocabulário e ortografia do Reino Unido (ex: colour, flat, lift).
    - Sindarin: Use a gramática e léxico de J.R.R. Tolkien.
    - Dothraki: Use o vocabulário oficial criado por David J. Peterson.
    - Xhosa: Destaque os cliques fonéticos.

    ${isSecretOfNine ? `METODOLOGIA SEGREDO DOS NOVE: Foque nos padrões rítmicos dos números.` : ''}
    ${isDaysOfWeek ? `METODOLOGIA ADAPTATIVA: Use o ambiente "${userContext || 'Geral'}" para os verbos e exemplos.` : ''}
    
    REQUISITOS JSON:
    - title, explanation (min 3 parágrafos explicativos), vocabulary (10 itens com exemplo), exercises (50 itens), culturalContext.
    
    Retorne JSON puro.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          explanation: { type: Type.STRING },
          vocabulary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                translation: { type: Type.STRING },
                example: { type: Type.STRING }
              }
            }
          },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              }
            }
          },
          culturalContext: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Generates a full curriculum (Syllabus) ensuring core methodologies are prioritized.
 */
export const generateSyllabus = async (language: string, level: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Crie um currículo de 12 tópicos para ${language} (${level}). 
    Inclua os fundamentos da escrita e fonética específicos de ${language}.
    Retorne JSON array de objetos {id, title, description, isSpecial, requiresContext}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            isSpecial: { type: Type.BOOLEAN },
            requiresContext: { type: Type.BOOLEAN }
          },
          required: ["id", "title", "description"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const generatePlacementTest = async (language: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Gere um teste de nivelamento para ${language}. 6 questões progressivas. JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generateImageForVocabulary = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Educational high-quality illustration: ${prompt}` }] }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const startVideoGeneration = async (prompt: string, language: string) => {
  const ai = getAI();
  return await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Language learning scenario for ${language}: ${prompt}`,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });
};

export const pollVideoStatus = async (operation: any) => {
  const ai = getAI();
  return await ai.operations.getVideosOperation({ operation });
};
