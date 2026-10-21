import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  // Não derruba o boot: o fallback heurístico do /api/generate-content continua
  // funcionando sem chave. Só deixa explícito o motivo da degradação.
  console.warn(
    '[gemini] GEMINI_API_KEY ausente ou vazia. /api/generate-content usará apenas o fallback heurístico.'
  );
}

// Timeout por requisição: sem ele, uma chamada lenta segura a function instance
// até o limite da plataforma e o usuário fica com spinner indefinido.
export const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    timeout: Number(process.env.GEMINI_TIMEOUT_MS) || 45_000,
  },
});
