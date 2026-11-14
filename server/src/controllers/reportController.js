import { reportSchema } from '../schemas/index.js';
import { extractDomain, hashDomain } from '../utils/crypto.js';
import { db } from '../db/index.js';

export async function reportScam(req, res) {
  try {
    const parse = reportSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0]?.message || 'Invalid report data' });
    }

    const { target, reason } = parse.data;
    const domain = extractDomain(target) || target.toLowerCase().trim();
    const domainHash = hashDomain(domain);

    if (!domainHash) {
      return res.status(400).json({ error: 'Unable to parse domain from target' });
    }

    const report = await db.incrementCommunityReport(domainHash);

    return res.json({
      message: 'Scam domain successfully reported to community blacklist.',
      domainHash,
      reportCount: report ? report.report_count : 1
    });
  } catch (error) {
    console.error('reportScam error:', error);
    return res.status(500).json({ error: 'Server error processing report' });
  }
}
