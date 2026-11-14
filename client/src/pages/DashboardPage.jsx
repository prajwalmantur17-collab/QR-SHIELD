import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Layers, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  Clock, 
  Lock,
  Radar
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verdictFilter, setVerdictFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await api.get('/stats');
        setStats(statsRes.data);

        if (isAuthenticated) {
          const histRes = await api.get('/history');
          setHistory(histRes.data.scans || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated]);

  const filteredHistory = history.filter(scan => {
    if (verdictFilter === 'all') return true;
    return scan.verdict === verdictFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-dark-text tracking-tight flex items-center space-x-2.5">
            <span>Live Security Telemetry</span>
          </h1>
          <p className="text-xs text-dark-muted mt-1">
            Real-time threat monitoring and zero-knowledge scan audit records.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="flex items-center space-x-3 bg-brand-indigo/10 border border-brand-indigo/30 p-2.5 rounded-xl text-xs">
            <span className="text-brand-cyan font-medium">Viewing real-time database stats. Log in to track your personal scans.</span>
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg bg-brand-indigo text-white font-bold hover:opacity-95 transition-opacity"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-mono text-dark-muted">
            <span>Signed in:</span>
            <span className="text-brand-cyan font-bold">{user?.email}</span>
          </div>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-dark-surface border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-dark-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Scans</span>
            <Activity className="w-4 h-4 text-brand-indigo" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-dark-text font-mono">
            {stats?.totalScans ?? 0}
          </p>
          <span className="text-[11px] text-emerald-400 block font-medium">
            Active Threat Shielding
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-dark-surface border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-dark-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Threats Neutralized</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
            {stats?.threatsBlocked ?? 0}
          </p>
          <span className="text-[11px] text-rose-300 block font-medium">
            Phishing & Malicious QRs Blocked
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-dark-surface border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-dark-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Safe</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {stats?.safeCount ?? 0}
          </p>
          <span className="text-[11px] text-dark-muted block">
            Passed rule & AI verification
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-dark-surface border border-dark-border space-y-2">
          <div className="flex items-center justify-between text-dark-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Privacy Integrity</span>
            <Lock className="w-4 h-4 text-brand-cyan" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-brand-cyan font-mono">
            100%
          </p>
          <span className="text-[11px] text-dark-muted block">
            0 Raw URLs/texts logged
          </span>
        </div>
      </div>

      {/* Visual Charts: Donut + Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Chart: Verdict Distribution */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-dark-surface border border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-dark-text tracking-tight uppercase">
              Threat Verdict Distribution
            </h3>
            <span className="text-xs font-mono text-dark-muted">All Time</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {stats?.totalScans > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.verdictDistribution}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.verdictDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#111936',
                      borderColor: '#26325F',
                      borderRadius: '12px',
                      color: '#E5E9F7',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                <Radar className="w-12 h-12 text-dark-muted/40 animate-pulse" />
                <p className="text-xs font-semibold text-dark-text">No scans recorded yet</p>
                <p className="text-[11px] text-dark-muted max-w-xs">
                  Run a scan using the live scanner to start populating real-time threat telemetry.
                </p>
                <Link
                  to="/scan"
                  className="mt-2 text-xs font-bold text-brand-cyan hover:underline"
                >
                  Scan an item now →
                </Link>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex justify-around text-xs font-medium pt-2 border-t border-dark-border/40">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-verdict-safe"></span>
              <span>Safe ({stats?.safeCount ?? 0})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-verdict-suspicious"></span>
              <span>Suspicious ({stats?.suspiciousCount ?? 0})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-verdict-dangerous"></span>
              <span>Dangerous ({stats?.dangerousCount ?? 0})</span>
            </div>
          </div>
        </div>

        {/* Line Chart: Scans Over Time */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-dark-surface border border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-dark-text tracking-tight uppercase">
              Scan Velocity (Past 7 Days)
            </h3>
            <span className="text-xs font-mono text-dark-muted">Live Activity</span>
          </div>

          <div className="h-64 w-full">
            {stats?.scansOverTime ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.scansOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18224A" />
                  <XAxis dataKey="date" stroke="#8B95B8" fontSize={11} />
                  <YAxis stroke="#8B95B8" fontSize={11} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#111936',
                      borderColor: '#26325F',
                      borderRadius: '12px',
                      color: '#E5E9F7',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="scans"
                    stroke="#22D3EE"
                    strokeWidth={3}
                    dot={{ fill: '#6366F1', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

      </div>

      {/* Top Scam Categories (Only displayed if categories exist) */}
      {stats?.topCategories && stats.topCategories.length > 0 && stats.totalScans > 0 && (
        <div className="p-6 rounded-2xl bg-dark-surface border border-dark-border space-y-4">
          <h3 className="text-sm font-bold text-dark-text tracking-tight uppercase">
            Top Detected Scam Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {stats.topCategories.map((cat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-dark-elevated border border-dark-border/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-dark-muted uppercase font-mono block">Category #{idx + 1}</span>
                  <span className="text-xs font-bold text-dark-text">{cat.name}</span>
                </div>
                <span className="text-sm font-mono font-extrabold text-brand-cyan">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Scans Table (Logged-in User) */}
      {isAuthenticated && (
        <div className="p-6 rounded-2xl bg-dark-surface border border-dark-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-dark-text tracking-tight uppercase">
                Your Scan Audit Log
              </h3>
              <p className="text-xs text-dark-muted mt-0.5">
                Masked identifiers with salted hashes (Zero raw URLs or messages stored).
              </p>
            </div>

            {/* Verdict Filter */}
            <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-dark-elevated border border-dark-border text-xs">
              {['all', 'dangerous', 'suspicious', 'safe'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setVerdictFilter(tab)}
                  className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${
                    verdictFilter === tab
                      ? 'bg-brand-indigo text-white'
                      : 'text-dark-muted hover:text-dark-text'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-dark-border text-dark-muted font-mono uppercase text-[10px]">
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Zero-Knowledge ID</th>
                    <th className="py-3 px-3">Verdict</th>
                    <th className="py-3 px-3">Risk Score</th>
                    <th className="py-3 px-3">Threat Category</th>
                    <th className="py-3 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40 font-mono">
                  {filteredHistory.map((item) => {
                    const isDangerous = item.verdict === 'dangerous';
                    const isSuspicious = item.verdict === 'suspicious';
                    const badgeClass = isDangerous
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                      : isSuspicious
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

                    return (
                      <tr key={item.id} className="hover:bg-dark-elevated/40 transition-colors">
                        <td className="py-3 px-3 uppercase font-bold text-brand-cyan">
                          {item.input_type}
                        </td>
                        <td className="py-3 px-3 text-dark-text">
                          {item.masked_identifier}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeClass}`}>
                            {item.verdict}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-dark-text">
                          {item.risk_score} / 100
                        </td>
                        <td className="py-3 px-3 font-sans text-dark-muted">
                          {item.scam_category || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-dark-muted text-[11px]">
                          {new Date(item.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-dark-muted space-y-2">
              <p>No scans recorded in your history yet.</p>
              <Link to="/scan" className="text-brand-cyan font-semibold hover:underline">
                Run your first scan on the scanner →
              </Link>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
