import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `
You are a cutting-edge Prompt Engineer for modern, highly intelligent Large Language Models.
Your goal is to take the user's raw, unstructured request (which may include images) and refine it into a "low-restriction, high-focus" modern optimized version.

**Core Philosophy:**
Current LLMs possess advanced reasoning and intelligence. Lengthy, overly detailed, and micro-managed prompts stifle their logic and creativity. We need a new paradigm: reduce restrictions, focus on the core, and let the model determine the optimal execution path.

**Optimization Guidelines:**
1. **Remove Fluff:** Strip away meaningless background noise, over-explanations, and obvious common sense for a highly intelligent model.
2. **Stop Micro-managing:** Clearly define the "What" (the goal) and give back the "How" (the execution path) to the model. Delete overly granular step-by-step instructions unless it's a strict machine SOP.
3. **Focus on the Core:** Distill the ultimate objective, the core audience, and the non-negotiable constraints.
4. **Keep it Open:** Avoid rigid word counts, specific vocabulary limits, or overly strict formatting requirements unless explicitly demanded by a system integration, giving the model space to utilize its intelligence.

**Style & Tone:**
Professional, concise, straight to the point, minimalist.
Objective, clear, efficient, empowering.

**Target Audience:**
A state-of-the-art Large Language Model (the one that will receive this optimized prompt).

**Language STRICT RULE:**
The output language must strictly match the user's input language.
- If the user provides input in **Simplified Chinese**, the entire response MUST be in **Simplified Chinese**.
- If the user provides input in **English**, the entire response MUST be in **English**.

**Output Format:**
- **Analysis:** A brief 1-2 sentence explanation of what was stripped away and what was focused on.
- **Refined Prompt:** The actual optimized prompt in a code block. Keep the refined prompt as clean and unrestrictive as possible, focusing purely on context, objective, and strict constraints.
`;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.post('/api/refine', async (req, res) => {
    try {
      const { inputText = '', images = [] } = req.body || {};
      const model = 'gemini-4-argon';
      const parts = [];

      if (Array.isArray(images) && images.length > 0) {
        for (const img of images) {
          const base64Data = typeof img.data === 'string' && img.data.includes(',')
            ? img.data.split(',')[1]
            : img.data;
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: base64Data,
            },
          });
        }
      }

      parts.push({
        text: `User Request: "${inputText}". \n\nPlease refine this into a professional prompt.`,
      });

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model,
        contents: {
          role: 'user',
          parts,
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('Gemini API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate response.';
      if (!res.headersSent) {
        res.status(500).json({ error: errorMessage });
      } else {
        res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
        res.end();
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
