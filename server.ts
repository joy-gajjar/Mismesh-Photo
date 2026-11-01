import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { MASTER_BRAND_PROMPT } from './src/utils/prompt';

dotenv.config();

const app = express();
const PORT = 3000;

// Parse large JSON payloads for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_LOGO_PATH = path.resolve(
  process.cwd(),
  'public/assets/aistudio/WhatsApp_Image_2026-11-01_at_13.33.39_4af04a57.jpeg'
);

// Helper to get default logo base64
function getDefaultLogoBase64(): { data: string; mimeType: string } | null {
  try {
    if (fs.existsSync(DEFAULT_LOGO_PATH)) {
      const buffer = fs.readFileSync(DEFAULT_LOGO_PATH);
      return {
        data: buffer.toString('base64'),
        mimeType: 'image/jpeg',
      };
    }
  } catch (err) {
    console.error('Error reading default logo:', err);
  }
  return null;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    logoExists: fs.existsSync(DEFAULT_LOGO_PATH),
  });
});

// Endpoint to fetch default logo info & data
app.get('/api/logo', (req: Request, res: Response) => {
  const logo = getDefaultLogoBase64();
  if (logo) {
    res.json({
      success: true,
      dataUrl: `data:${logo.mimeType};base64,${logo.data}`,
      mimeType: logo.mimeType,
      path: '/assets/aistudio/WhatsApp_Image_2026-11-01_at_13.33.39_4af04a57.jpeg',
    });
  } else {
    res.status(404).json({ success: false, error: 'Brand logo file not found' });
  }
});

// Product transformation endpoint powered by Gemini AI Image Editing
app.post('/api/transform-product', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', gradientName = 'Slate and Copper' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        fallbackRecommended: true,
        error: 'GEMINI_API_KEY not configured. Falling back to high-fidelity studio compositor.',
      });
    }

    // Clean base64 data prefix if present
    const cleanProductBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    // Get company logo
    const logoObj = getDefaultLogoBase64();

    // Prepare contents with product image and logo image
    const contentsParts: any[] = [
      {
        inlineData: {
          data: cleanProductBase64,
          mimeType: mimeType || 'image/jpeg',
        },
      },
    ];

    if (logoObj) {
      contentsParts.push({
        inlineData: {
          data: logoObj.data,
          mimeType: logoObj.mimeType,
        },
      });
    }

    const fullPrompt = `${MASTER_BRAND_PROMPT}\n\n[Commercial Studio Specification]: Transform the first image (product photo) into a realistic, high-end commercial studio product photograph on an elegant gradient background inspired by ${gradientName}. The second image is the company logo; place it neatly in the top-right corner as a brand watermark (5-8% width). Enhance realistic studio lighting, ambient reflections, and soft contact floor shadows while strictly preserving the product's authentic geometry, color, and texture.`;

    contentsParts.push({
      text: fullPrompt,
    });

    let transformedImageUrl: string | null = null;
    let descriptionText = '';

    // Primary: Try gemini-nano-banana-2.1 for high-quality commercial studio output
    // Secondary: Try gemini-3.1-flash-lite-image
    const modelsToTry = ['gemini-nano-banana-2.1', 'gemini-3.1-flash-lite-image'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(`Calling Gemini image model: ${model}...`);
        const response = await ai.models.generateContent({
          model,
          contents: { parts: contentsParts },
          config: {
            imageConfig: {
              aspectRatio: '1:1',
            },
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts ?? []) {
          if (part.inlineData?.data) {
            const outMime = part.inlineData.mimeType ?? 'image/png';
            transformedImageUrl = `data:${outMime};base64,${part.inlineData.data}`;
            break;
          } else if (part.text) {
            descriptionText += part.text + ' ';
          }
        }

        if (transformedImageUrl) {
          console.log(`Successfully generated commercial image with ${model}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        // Check if quota error (free tier has 0 quota for image models)
        const isQuota = String(err?.message || '').includes('429') ||
                        String(err?.message || '').includes('quota') ||
                        String(err?.message || '').includes('RESOURCE_EXHAUSTED');
        if (isQuota) {
          // Free tier has 0 quota for image models; break early to avoid extra failed calls
          break;
        }
      }
    }

    if (transformedImageUrl) {
      return res.json({
        success: true,
        transformedImageUrl,
        notes: descriptionText.trim(),
      });
    }

    // Gracefully report status without HTTP 500/429 error codes
    const errMsg = lastError?.message || 'Gemini model did not return an image binary';
    const isQuota = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED');

    return res.json({
      success: false,
      quotaExceeded: isQuota,
      fallbackToStudio: true,
      message: isQuota
        ? 'Free tier API key has 0 quota for image models. Studio 3D engine rendered the asset.'
        : errMsg,
      notes: descriptionText.trim(),
    });

    // If Gemini model returned text only or didn't output an image binary
    return res.json({
      success: false,
      fallbackRecommended: true,
      notes: descriptionText.trim() || 'Model processed request without generating raw image binary.',
      error: 'Direct image output not returned by model; studio compositor will render result.',
    });
  } catch (error: any) {
    return res.json({
      success: false,
      fallbackRecommended: true,
      error: error?.message || 'Error processing image transformation',
    });
  }
});

async function startServer() {
  // Mount Vite middlewares in development
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
