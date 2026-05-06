import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // API Routes
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, context } = req.body;

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key is not configured.' });
      }

      const systemPrompt = `당신은 '빌더 클럽(Builder Club)'의 AI 비서 '빌더 AI'입니다. 
빌더 클럽은 창업가, 개발자, 마케터들이 모여 서로의 프로젝트 진행 상황을 공유하고, 지식을 나누며, 함께 성장하는 커뮤니티입니다.

현재 빌더 클럽의 상황(Context):
${JSON.stringify(context, null, 2)}

위 데이터를 바탕으로 사용자의 질문에 친절하고 전문적으로 답변해주세요. 
사용자가 프로젝트의 진행 상태, 다른 멤버의 전문 분야, 지식 공유 내용, 혹은 최근의 낙서장(Scratchpad) 내용에 대해 물어볼 수 있습니다.
답변은 항상 한국어로 해주세요.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
      });

      res.json({ message: response.choices[0].message.content });
    } catch (error: any) {
      console.error('Error in /api/chat:', error);
      res.status(500).json({ error: error.message || 'AI 응답을 생성하는 중 오류가 발생했습니다.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
