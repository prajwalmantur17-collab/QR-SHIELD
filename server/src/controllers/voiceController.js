import { getAnnouncementSpeech, SUPPORTED_LANGUAGES, SUPPORTED_RESULTS } from '../services/voiceService.js';
import { z } from 'zod';

const voiceRequestSchema = z.object({
  language: z.enum(['en', 'kn', 'hi']).default('en'),
  resultType: z.enum(['safe', 'suspicious', 'dangerous', 'failed']).default('safe')
});

/**
 * Voice Announcement Controller: POST /api/voice/announce
 * Validates request parameters and serves cached or newly generated ElevenLabs audio.
 */
export async function announceVoice(req, res) {
  try {
    const parse = voiceRequestSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        error: 'Invalid voice request parameters. Language must be en/kn/hi and resultType must be safe/suspicious/dangerous/failed.'
      });
    }

    const { language, resultType } = parse.data;
    const speechResult = await getAnnouncementSpeech(language, resultType);

    return res.json(speechResult);
  } catch (error) {
    console.error('announceVoice error:', error);
    return res.status(500).json({
      error: 'Failed to generate voice announcement',
      fallback: true
    });
  }
}
