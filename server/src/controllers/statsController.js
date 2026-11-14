import { db } from '../db/index.js';

export async function getStats(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const stats = await db.getStats(userId);
    return res.json(stats);
  } catch (error) {
    console.error('getStats error:', error);
    return res.status(500).json({ error: 'Server error retrieving statistics' });
  }
}

export async function getHistory(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required to view scan history.' });
    }

    const scans = await db.getUserScans(req.user.id, 50);

    // Format for client display (never reveal raw content, display masked preview)
    const formatted = scans.map(s => ({
      id: s.id,
      input_type: s.input_type,
      // Provide a safe shortened identifier for display
      masked_identifier: `${s.input_type.toUpperCase()} #${s.content_hash.slice(0, 8)}`,
      content_hash: s.content_hash,
      domain_hash: s.domain_hash,
      verdict: s.verdict,
      risk_score: s.risk_score,
      scam_category: s.scam_category,
      ai_used: s.ai_used,
      created_at: s.created_at
    }));

    return res.json({ scans: formatted });
  } catch (error) {
    console.error('getHistory error:', error);
    return res.status(500).json({ error: 'Server error retrieving history' });
  }
}
