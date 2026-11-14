import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Clock, 
  Search,
  Filter,
  ArrowRight,
  Radar,
  TrendingUp,
  Download,
  CheckCircle2,
  Inbox
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
import Card, { CardHeader } from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Tabs from '../components/common/Tabs';
import EmptyState from '../components/common/EmptyState';

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

  const chartColors = {
    Safe: '#23845D',
    Suspicious: '#C58A32',
    Dangerous: '#D45B61'
  };

  const filterTabs = [
    { id: 'all', label: 'All Records' },
    { id: 'dangerous', label: 'Dangerous' },
    { id: 'suspicious', label: 'Suspicious' },
    { id: 'safe', label: 'Safe' }
  ];

  return (
    <div className="space-y-8 select-none">
      
      {/* 1. Header with Breadcrumbs & User State */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border dark:border-dark-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-content-primary dark:text-dark-primary tracking-tight">
            Security Telemetry & Threat Analytics
          </h1>
          <p className="text-xs text-content-secondary dark:text-dark-secondaryText mt-0.5">
            Real-time heuristic distribution, SSRF audit logs, and zero-knowledge scan records.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="flex items-center space-x-3 bg-brand-teal-subtle dark:bg-dark-secondary border border-brand-teal/20 px-3.5 py-2 rounded-xl text-xs">
            <span className="text-brand-teal-text dark:text-brand-teal font-medium">
              Viewing global benchmark stats.
            </span>
            <Link to="/login">
              <Button size="xs" variant="primary">Sign In to Track</Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-content-secondary dark:text-dark-secondaryText bg-white dark:bg-dark-surface border border-border dark:border-dark-border px-3 py-1.5 rounded-lg shadow-subtle">
            <span className="text-content-muted">Operator:</span>
            <strong className="text-content-primary dark:text-dark-primary font-semibold font-mono">{user?.email}</strong>
          </div>
        )}
      </div>

      {/* 2. Top Metric KPI Cards (Linear / Stripe Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Scans */}
        <Card padding="md" className="space-y-1.5">
          <div className="flex items-center justify-between text-content-secondary dark:text-dark-secondaryText">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Total Evaluations</span>
            <div className="p-1.5 rounded-md bg-canvas-subtle dark:bg-dark-secondary text-brand-teal">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-content-primary dark:text-dark-primary font-mono tracking-tight">
            {stats?.totalScans ?? 0}
          </p>
          <span className="text-[11px] text-content-muted dark:text-dark-muted block">
            Rules & Gemini AI Synthesis
          </span>
        </Card>

        {/* Threats Neutralized */}
        <Card padding="md" className="space-y-1.5">
          <div className="flex items-center justify-between text-content-secondary dark:text-dark-secondaryText">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Threats Blocked</span>
            <div className="p-1.5 rounded-md bg-status-danger-bg text-status-danger">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-status-danger font-mono tracking-tight">
            {stats?.threatsBlocked ?? 0}
          </p>
          <span className="text-[11px] text-status-danger font-medium block">
            Phishing & Disguised UPI Intercepted
          </span>
        </Card>

        {/* Verified Safe */}
        <Card padding="md" className="space-y-1.5">
          <div className="flex items-center justify-between text-content-secondary dark:text-dark-secondaryText">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Verified Safe</span>
            <div className="p-1.5 rounded-md bg-status-success-bg text-status-success">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-status-success font-mono tracking-tight">
            {stats?.safeCount ?? 0}
          </p>
          <span className="text-[11px] text-content-muted dark:text-dark-muted block">
            Passed all security benchmarks
          </span>
        </Card>

        {/* Privacy Integrity */}
        <Card padding="md" className="space-y-1.5">
          <div className="flex items-center justify-between text-content-secondary dark:text-dark-secondaryText">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Privacy Rating</span>
            <div className="p-1.5 rounded-md bg-brand-blue-subtle text-brand-blue">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-content-primary dark:text-dark-primary font-mono tracking-tight">
            100%
          </p>
          <span className="text-[11px] text-content-muted dark:text-dark-muted block">
            0 Raw URLs/texts retained
          </span>
        </Card>

      </div>

      {/* 3. Analytics Visualizations: Donut + Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Chart: Verdict Distribution */}
        <Card padding="md" className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border dark:border-dark-border">
            <h3 className="text-xs font-bold text-content-primary dark:text-dark-primary uppercase tracking-wider font-mono">
              Verdict Breakdown
            </h3>
            <Badge variant="neutral" size="xs">Cumulative</Badge>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {stats && stats.totalScans > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.verdictDistribution}
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.verdictDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[entry.name] || '#687782'} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8E5',
                      borderRadius: '8px',
                      color: '#202B35',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(16, 24, 40, 0.08)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                <Radar className="w-8 h-8 text-content-muted/60 animate-pulse" />
                <p className="text-xs font-semibold text-content-primary dark:text-dark-primary">No scans recorded</p>
                <Link to="/scan">
                  <Button size="xs" variant="primary">Launch Scanner</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex justify-around text-xs font-medium pt-2 border-t border-border dark:border-dark-border text-content-secondary dark:text-dark-secondaryText">
            <div className="flex items-center space-x-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-status-success" />
              <span>Safe ({stats?.safeCount ?? 0})</span>
            </div>
            <div className="flex items-center space-x-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-status-warning" />
              <span>Suspicious ({stats?.suspiciousCount ?? 0})</span>
            </div>
            <div className="flex items-center space-x-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-status-danger" />
              <span>Dangerous ({stats?.dangerousCount ?? 0})</span>
            </div>
          </div>
        </Card>

        {/* Line Chart: Telemetry Velocity */}
        <Card padding="md" className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border dark:border-dark-border">
            <h3 className="text-xs font-bold text-content-primary dark:text-dark-primary uppercase tracking-wider font-mono">
              Scan Velocity (Past 7 Days)
            </h3>
            <Badge variant="teal" size="xs">Rolling Activity</Badge>
          </div>

          <div className="h-56 w-full">
            {stats?.scansOverTime ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.scansOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDF1EF" />
                  <XAxis dataKey="date" stroke="#89959D" fontSize={11} fontStyle="monospace" />
                  <YAxis stroke="#89959D" fontSize={11} allowDecimals={false} fontStyle="monospace" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8E5',
                      borderRadius: '8px',
                      color: '#202B35',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(16, 24, 40, 0.08)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="scans"
                    stroke="#167D73"
                    strokeWidth={2.5}
                    dot={{ fill: '#167D73', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </Card>

      </div>

      {/* 4. Top Scam Categories */}
      {stats?.topCategories && stats.topCategories.length > 0 && stats.totalScans > 0 && (
        <Card padding="md" className="space-y-4">
          <h3 className="text-xs font-bold text-content-primary dark:text-dark-primary uppercase tracking-wider font-mono">
            Top Detected Threat Vectors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {stats.topCategories.map((cat, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-content-muted dark:text-dark-muted uppercase font-mono block">Rank #{idx + 1}</span>
                  <span className="text-xs font-bold text-content-primary dark:text-dark-primary">{cat.name}</span>
                </div>
                <span className="text-sm font-mono font-bold text-brand-teal">{cat.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 5. User Scan Audit Log (Authenticated) */}
      {isAuthenticated && (
        <Card padding="md" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border dark:border-dark-border">
            <div>
              <h3 className="text-xs font-bold text-content-primary dark:text-dark-primary uppercase tracking-wider font-mono">
                Your Zero-Knowledge Scan Audit Log
              </h3>
              <p className="text-xs text-content-secondary dark:text-dark-secondaryText mt-0.5">
                Masked identifiers with salted hashes (Zero raw URLs or messages stored).
              </p>
            </div>

            {/* Verdict Filter Tabs */}
            <Tabs
              tabs={filterTabs}
              activeTab={verdictFilter}
              onChange={setVerdictFilter}
              size="sm"
            />
          </div>

          {filteredHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border dark:border-dark-border text-content-muted dark:text-dark-muted font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Zero-Knowledge Fingerprint</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 px-3">Risk Score</th>
                    <th className="py-2.5 px-3">Threat Category</th>
                    <th className="py-2.5 px-3">Audit Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 dark:divide-dark-border/40 font-mono">
                  {filteredHistory.map((item) => {
                    const variant = item.verdict === 'dangerous' ? 'dangerous' : item.verdict === 'suspicious' ? 'suspicious' : 'safe';

                    return (
                      <tr key={item.id} className="hover:bg-canvas-subtle/50 dark:hover:bg-dark-secondary/30 transition-colors">
                        <td className="py-2.5 px-3 uppercase font-bold text-brand-teal">
                          {item.input_type}
                        </td>
                        <td className="py-2.5 px-3 text-content-primary dark:text-dark-primary">
                          {item.masked_identifier}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant={variant} size="xs">
                            {item.verdict}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-content-primary dark:text-dark-primary">
                          {item.risk_score} / 100
                        </td>
                        <td className="py-2.5 px-3 font-sans text-content-secondary dark:text-dark-secondaryText">
                          {item.scam_category || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-content-muted dark:text-dark-muted text-[11px]">
                          {new Date(item.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No scan records match this filter"
              description="Scanned items will appear here with cryptographic HMAC fingerprints."
              actionLabel="Launch Threat Scanner"
              onAction={() => window.location.href = '/scan'}
            />
          )}
        </Card>
      )}

    </div>
  );
}
