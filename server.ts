import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[Server] Starting boot process...');

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;

    console.log('[Server] Initializing middleware...');
    // Request logging
    app.use((req, res, next) => {
      console.log(`[Server] ${new Date().toISOString()} ${req.method} ${req.url}`);
      next();
    });

    app.use(express.json());

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        environment: process.env.NODE_ENV, 
        hasApiKey: !!process.env.OPENAI_API_KEY,
        time: new Date().toISOString()
      });
    });

    console.log('[Server] Initializing OpenAI...');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'missing-key',
    });

    // Log API Key status
    if (process.env.OPENAI_API_KEY) {
      console.log(`[AI Server] OpenAI API Key is present (Starts with: ${process.env.OPENAI_API_KEY.substring(0, 7)}...)`);
    } else {
      console.error('[AI Server] CRITICAL WARNING: OPENAI_API_KEY is missing from environment variables!');
    }

    // API Routes
    app.post('/api/chat', async (req, res) => {
      console.log('[Server] Handling /api/chat request');
      try {
        const { messages, context } = req.body;

        if (!process.env.OPENAI_API_KEY) {
          console.error('[Server] Chat requested but API key missing');
          return res.status(500).json({ error: 'OpenAI API key is not configured.' });
        }

        const systemPrompt = `당신은 '빌더 클럽(Builder Club)'의 AI 비서 '빌더 AI'입니다. 
빌더 클럽은 창업가, 개발자, 마케터들이 모여 서로의 프로젝트 진행 상황을 공유하고, 지식을 나누며, 함께 성장하는 커뮤니티입니다.

현재 빌더 클럽의 상황(Context):
${JSON.stringify(context, null, 2)}

위 데이터를 바탕으로 사용자의 질문에 친절하고 전문적으로 답변해주세요. 
사용자가 프로젝트의 진행 상태, 다른 멤버의 전문 분야, 지식 공유 내용, 혹은 최근의 낙서장(Scratchpad) 내용에 대해 물어볼 수 있습니다.
답변은 항상 한국어로 해주세요.`;

        console.log('[Server] Calling OpenAI...');
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          temperature: 0.7,
        });
        console.log('[Server] OpenAI call successful');

        res.json({ message: response.choices[0].message.content });
      } catch (error: any) {
        console.error('Error in /api/chat:', error);
        res.status(500).json({ error: error.message || 'AI 응답을 생성하는 중 오류가 발생했습니다.' });
      }
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Server] Setting up Vite middleware...');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      console.log('[Server] Setting up production static serving...');
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] READY and listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] FATAL STARTUP ERROR:', err);
    process.exit(1);
  }
}

startServer();
