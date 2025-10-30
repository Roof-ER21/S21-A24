/**
 * S21-A24 Status Dashboard
 * Real-time monitoring of AI providers, costs, and system health
 */

import { useState, useEffect } from 'react';
import { Activity, DollarSign, Zap, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { healthChecker, getHealthSummary } from '../lib/health-checker';
import { costTracker, getCostSummary, checkBudget } from '../lib/cost-tracker';
import type { AIProvider } from '../lib/ai-router';

export function StatusDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [healthSummary, setHealthSummary] = useState(getHealthSummary());
  const [costSummary, setCostSummary] = useState(getCostSummary());
  const [budgetAlert, setBudgetAlert] = useState(checkBudget());

  useEffect(() => {
    // Update every 10 seconds
    const interval = setInterval(() => {
      setHealthSummary(getHealthSummary());
      setCostSummary(getCostSummary());
      setBudgetAlert(checkBudget());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const providerStatuses = healthChecker.getAllStatuses();

  return (
    <>
      {/* Floating Status Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-50
          flex items-center gap-2 px-4 py-3 rounded-full
          shadow-lg transition-all hover:scale-105 backdrop-blur-md border border-white/10
          ${budgetAlert?.level === 'exceeded' || budgetAlert?.level === 'critical'
            ? 'bg-red-600 text-white'
            : budgetAlert?.level === 'warning'
            ? 'bg-yellow-400 text-black'
            : 'bg-white/10 text-white'
          }
        `}
      >
        <Activity className="w-5 h-5" />
        <span className="font-medium">
          {healthSummary.healthyProviders}/{healthSummary.totalProviders} OK
        </span>
      </button>

      {/* Dashboard Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/15 bg-[#111]/95">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#7f1d1d] to-[#c1121f] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">S21-A24 Status Dashboard</h2>
                  <p className="text-white/80 text-sm">Real-time system monitoring</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Budget Alert Banner */}
            {budgetAlert && budgetAlert.level !== 'safe' && (
              <div
                className={`
                  p-4 border-b
                  ${budgetAlert.level === 'exceeded'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    : budgetAlert.level === 'critical'
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">{budgetAlert.message}</p>
                    <div className="mt-1 bg-white/30 dark:bg-black/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-current transition-all"
                        style={{ width: `${Math.min(budgetAlert.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Cost Overview */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Cost Overview</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <CostCard label="Today" value={costSummary.today} />
                  <CostCard label="Yesterday" value={costSummary.yesterday} />
                  <CostCard label="This Month" value={costSummary.thisMonth} />
                  <CostCard label="Total" value={costSummary.total} />
                </div>

                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm font-medium text-white/80 mb-2">
                    Cost by Provider
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(costSummary.byProvider).map(([provider, cost]) => (
                      <div key={provider} className="flex justify-between">
                        <span className="text-sm text-white/70 capitalize">
                          {provider}:
                        </span>
                        <span className="text-sm font-semibold text-white">
                          ${cost.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Provider Health */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-[var(--s21-secondary)]" />
                  <h3 className="text-xl font-bold text-white">Provider Health</h3>
                </div>

                <div className="space-y-3">
                  {(Object.keys(providerStatuses) as AIProvider[]).map((provider) => (
                    <ProviderStatusCard
                      key={provider}
                      provider={provider}
                      status={providerStatuses[provider]}
                    />
                  ))}
                </div>
              </section>

              {/* System Stats */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-[var(--s21-secondary)]" />
                  <h3 className="text-xl font-bold text-white">System Stats</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard
                    label="Avg Latency"
                    value={`${healthSummary.averageLatency.toFixed(0)}ms`}
                    icon={<Zap className="w-4 h-4" />}
                  />
                  <StatCard
                    label="Avg Uptime"
                    value={`${healthSummary.averageUptime.toFixed(1)}%`}
                    icon={<CheckCircle className="w-4 h-4" />}
                  />
                  <StatCard
                    label="Fastest"
                    value={healthSummary.fastestProvider || 'N/A'}
                    icon={<Zap className="w-4 h-4" />}
                    className="capitalize"
                  />
                </div>
              </section>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                <button
                  onClick={() => healthChecker.checkAllProviders()}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Refresh Health Checks
                </button>
                <button
                  onClick={() => {
                    const data = {
                      health: healthChecker.exportData(),
                      costs: costTracker.exportData(),
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `s21-a24-report-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                  }}
                  className="py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition"
                >
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper Components

function CostCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
      <p className="text-sm text-white/70">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">
        ${value.toFixed(4)}
      </p>
    </div>
  );
}

function ProviderStatusCard({
  provider,
  status,
}: {
  provider: AIProvider;
  status: any;
}) {
  return (
    <div className={`p-4 rounded-lg border transition ${status.isHealthy ? 'bg-white/5 border-white/10' : 'bg-red-900/20 border-red-600/50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status.isHealthy ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <div>
            <p className="font-semibold text-white capitalize">
              {provider}
            </p>
            <p className="text-sm text-white/70">
              {status.isHealthy ? 'Healthy' : status.errorMessage || 'Unavailable'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-white">
            {status.latency}ms
          </p>
          <p className="text-xs text-white/70">
            {status.uptime.toFixed(1)}% uptime
          </p>
        </div>
      </div>

      {status.consecutiveFailures > 0 && (
        <p className="mt-2 text-xs text-red-400">
          {status.consecutiveFailures} consecutive failures
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  className = '',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center gap-2 text-[var(--s21-secondary)] mb-1">
        {icon}
        <p className="text-sm">{label}</p>
      </div>
      <p className={`text-xl font-bold text-white ${className}`}>
        {value}
      </p>
    </div>
  );
}
