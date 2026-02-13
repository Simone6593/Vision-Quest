
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMotivationalMessage = async (score: number, level: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sei un simpatico gufo magico di nome Gemi. Un bambino ha appena completato il livello ${level} con un punteggio di ${score}. Scrivi un brevissimo messaggio di incoraggiamento (massimo 15 parole) in italiano, molto allegro e giocoso.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });
    return response.text || "Ottimo lavoro, piccolo esploratore!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sei stato bravissimo! Continua così!";
  }
};

export const getGameInstruction = async (gameType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Descrivi brevemente come giocare a un gioco di ${gameType} per un bambino di 6 anni. Sii magico e divertente. Massimo 20 parole.`,
    });
    return response.text || "Usa i tuoi occhi magici per trovare le forme!";
  } catch (error) {
    return "Pronto per la sfida? Cominciamo!";
  }
};
