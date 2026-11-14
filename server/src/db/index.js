import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id'));

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// File-backed persistent fallback store when Supabase is not configured
const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function loadLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading store.json, initializing fresh store:', err);
  }
  return {
    users: [],
    scans: [],
    scanSignals: [],
    communityReports: []
  };
}

let store = loadLocalStore();

function saveLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store.json:', err);
  }
}

export const db = {
  async findUserByEmail(email) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
      if (error && error.code !== 'PGRST116') console.error('Supabase findUserByEmail error:', error);
      return data || null;
    }
    store = loadLocalStore();
    return store.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser({ name, email, password_hash }) {
    const id = crypto.randomUUID();
    const newUser = {
      id,
      name,
      email: email.toLowerCase(),
      password_hash,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('users').insert(newUser).select().single();
      if (error) throw error;
      return data;
    }

    store = loadLocalStore();
    store.users.push(newUser);
    saveLocalStore();
    return newUser;
  },

  async findUserById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('users').select('id, name, email, created_at').eq('id', id).single();
      if (error) return null;
      return data;
    }
    store = loadLocalStore();
    const user = store.users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async deleteUserData(userId) {
    if (isSupabaseConfigured) {
      await supabase.from('users').delete().eq('id', userId);
      return true;
    }
    store = loadLocalStore();
    store.users = store.users.filter(u => u.id !== userId);
    const userScanIds = new Set(
      store.scans.filter(s => s.user_id === userId).map(s => s.id)
    );
    store.scans = store.scans.filter(s => s.user_id !== userId);
    store.scanSignals = store.scanSignals.filter(sig => !userScanIds.has(sig.scan_id));
    saveLocalStore();
    return true;
  },

  async findScanByContentHash(contentHash) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    if (isSupabaseConfigured) {
      const { data: scan, error } = await supabase
        .from('scans')
        .select('*')
        .eq('content_hash', contentHash)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !scan) return null;

      const { data: signals } = await supabase
        .from('scan_signals')
        .select('source, label, detail')
        .eq('scan_id', scan.id);

      return { ...scan, signals: signals || [] };
    }

    store = loadLocalStore();
    const cached = store.scans.find(
      s => s.content_hash === contentHash && new Date(s.created_at) >= new Date(twentyFourHoursAgo)
    );
    if (!cached) return null;

    const signals = store.scanSignals.filter(sig => sig.scan_id === cached.id);
    return { ...cached, signals };
  },

  async saveScan({ userId = null, inputType, contentHash, domainHash, verdict, riskScore, scamCategory, aiUsed, recommendedAction, signals = [] }) {
    const scanId = crypto.randomUUID();
    const scanRecord = {
      id: scanId,
      user_id: userId,
      input_type: inputType,
      content_hash: contentHash,
      domain_hash: domainHash,
      verdict,
      risk_score: riskScore,
      scam_category: scamCategory,
      ai_used: aiUsed,
      recommended_action: recommendedAction,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { error: scanErr } = await supabase.from('scans').insert(scanRecord);
      if (scanErr) console.error('Error saving scan to Supabase:', scanErr);

      if (signals.length > 0) {
        const signalRecords = signals.map(sig => ({
          scan_id: scanId,
          source: sig.source,
          label: sig.label,
          detail: sig.detail
        }));
        await supabase.from('scan_signals').insert(signalRecords);
      }

      return { ...scanRecord, signals };
    }

    store = loadLocalStore();
    store.scans.unshift(scanRecord);
    for (const sig of signals) {
      store.scanSignals.push({
        id: crypto.randomUUID(),
        scan_id: scanId,
        source: sig.source,
        label: sig.label,
        detail: sig.detail
      });
    }
    saveLocalStore();

    return { ...scanRecord, signals };
  },

  async getUserScans(userId, limit = 50) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('scans')
        .select('id, input_type, content_hash, domain_hash, verdict, risk_score, scam_category, ai_used, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return [];
      return data || [];
    }

    store = loadLocalStore();
    return store.scans
      .filter(s => s.user_id === userId)
      .slice(0, limit);
  },

  async getStats(userId = null) {
    let scansToAnalyze = [];

    if (isSupabaseConfigured) {
      let query = supabase.from('scans').select('verdict, risk_score, scam_category, created_at');
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data } = await query;
      scansToAnalyze = data || [];
    } else {
      store = loadLocalStore();
      scansToAnalyze = userId
        ? store.scans.filter(s => s.user_id === userId)
        : store.scans;
    }

    const total = scansToAnalyze.length;
    const safeCount = scansToAnalyze.filter(s => s.verdict === 'safe').length;
    const suspiciousCount = scansToAnalyze.filter(s => s.verdict === 'suspicious').length;
    const dangerousCount = scansToAnalyze.filter(s => s.verdict === 'dangerous').length;
    const threatsBlocked = suspiciousCount + dangerousCount;

    // Category breakdown
    const categoryCounts = {};
    for (const s of scansToAnalyze) {
      const cat = s.scam_category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    // Time series (by day for past 7 days)
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const count = scansToAnalyze.filter(s => s.created_at && s.created_at.startsWith(dayStr)).length;
      past7Days.push({
        date: dayStr.slice(5), // MM-DD
        scans: count
      });
    }

    return {
      totalScans: total,
      threatsBlocked,
      safeCount,
      suspiciousCount,
      dangerousCount,
      verdictDistribution: [
        { name: 'Safe', value: safeCount, color: '#22C55E' },
        { name: 'Suspicious', value: suspiciousCount, color: '#F59E0B' },
        { name: 'Dangerous', value: dangerousCount, color: '#EF4444' }
      ],
      scansOverTime: past7Days,
      topCategories: Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
  },

  async getCommunityReport(domainHash) {
    if (!domainHash) return null;
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('community_reports').select('*').eq('domain_hash', domainHash).single();
      return data || null;
    }
    store = loadLocalStore();
    return store.communityReports.find(r => r.domain_hash === domainHash) || null;
  },

  async incrementCommunityReport(domainHash) {
    if (!domainHash) return null;
    const now = new Date().toISOString();

    if (isSupabaseConfigured) {
      const existing = await this.getCommunityReport(domainHash);
      if (existing) {
        const { data } = await supabase
          .from('community_reports')
          .update({
            report_count: existing.report_count + 1,
            last_reported_at: now
          })
          .eq('domain_hash', domainHash)
          .select()
          .single();
        return data;
      } else {
        const { data } = await supabase
          .from('community_reports')
          .insert({
            domain_hash: domainHash,
            report_count: 1,
            first_reported_at: now,
            last_reported_at: now
          })
          .select()
          .single();
        return data;
      }
    }

    store = loadLocalStore();
    const existing = store.communityReports.find(r => r.domain_hash === domainHash);
    if (existing) {
      existing.report_count += 1;
      existing.last_reported_at = now;
      saveLocalStore();
      return existing;
    } else {
      const report = {
        id: crypto.randomUUID(),
        domain_hash: domainHash,
        report_count: 1,
        first_reported_at: now,
        last_reported_at: now
      };
      store.communityReports.push(report);
      saveLocalStore();
      return report;
    }
  }
};
