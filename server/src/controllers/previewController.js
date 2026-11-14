import { previewSchema } from '../schemas/index.js';
import { generateSafePreview } from '../services/previewService.js';

export async function handleSafePreview(req, res) {
  try {
    const validated = previewSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        error: validated.error.errors[0]?.message || 'Invalid URL provided',
        code: 'VALIDATION_ERROR'
      });
    }

    const { url } = validated.data;
    const previewData = await generateSafePreview(url);
    return res.json(previewData);
  } catch (err) {
    console.error('Preview Generation Error:', err.message);
    const isSsrf = err.message.includes('SSRF') || err.message.includes('restricted');
    return res.status(400).json({
      error: isSsrf 
        ? 'Preview Blocked: The target domain resolves to a restricted or private network space (SSRF protection).'
        : `Safe Preview Failed: ${err.message}`,
      code: isSsrf ? 'SSRF_BLOCKED' : 'PREVIEW_FAILED'
    });
  }
}
