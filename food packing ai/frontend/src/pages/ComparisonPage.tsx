import React, { useState, useEffect } from 'react';
import {
  Scale, Plus, X, ShieldCheck, Check, AlertTriangle, Layers,
  BarChart3, RefreshCw, Info
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { packagingService, foodService } from '../services/api';
import { PackagingOption, ComparisonResponse, FoodTypeSummary } from '../types';

interface ComparisonPageProps {
  initialOptionIds?: number[];
  initialFoodId?: number;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  initialOptionIds = [1, 2],
  initialFoodId
}) => {
  const [allOptions, setAllOptions] = useState<PackagingOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialOptionIds);
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    packagingService.getOptions()
      .then(setAllOptions)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (initialOptionIds && initialOptionIds.length >= 2) {
      setSelectedIds(initialOptionIds.slice(0, 4));
    }
  }, [initialOptionIds]);

  useEffect(() => {
    if (selectedIds.length >= 2) {
      setLoading(true);
      packagingService.compareOptions(selectedIds, initialFoodId)
        .then(setComparisonData)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setComparisonData(null);
    }
  }, [selectedIds, initialFoodId]);

  const toggleOption = (id: number) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  // Convert barrier levels to numerical score for Recharts
  const barrierToNumber = (b?: string) => {
    if (!b) return 5;
    const l = b.toLowerCase();
    if (l.includes('ultra')) return 10;
    if (l.includes('high')) return 8;
    if (l.includes('medium')) return 5;
    return 3;
  };

  const chartData = comparisonData?.options.map((opt) => ({
    name: opt.name.length > 20 ? opt.name.substring(0, 18) + '...' : opt.name,
    'Moisture Barrier': barrierToNumber(opt.material?.moisture_barrier),
    'Oxygen Barrier': barrierToNumber(opt.material?.oxygen_barrier),
    'Light Barrier': barrierToNumber(opt.material?.light_barrier),
    'Sustainability (1-10)': opt.sustainability_score || 5
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>Side-by-Side Technical Comparison</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Packaging Systems Comparison Matrix
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Select 2 to 4 candidate packages to inspect barrier performance, unit costs, equipment complexity, and recyclability side-by-side.
          </p>
        </div>
      </div>

      {/* Option Selector Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Selected Packages to Compare (Min 2, Max 4):
          </span>
          <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
            {selectedIds.length} of 4 Selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {allOptions.map((opt) => {
            const isSelected = selectedIds.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>{opt.name}</span>
                {isSelected ? <X className="w-3.5 h-3.5 ml-1" /> : <Plus className="w-3.5 h-3.5 ml-1 text-slate-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Calculating barrier matrices and side-by-side metrics...</p>
        </div>
      ) : comparisonData ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Comparison Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 sm:p-5 font-bold text-slate-500 uppercase tracking-wider w-1/4">
                      Specification Attribute
                    </th>
                    {comparisonData.options.map((opt) => (
                      <th key={opt.id} className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white">
                        <div className="text-base font-sans">{opt.name}</div>
                        <span className="text-[11px] font-normal text-slate-400 mt-0.5 block">
                          Format: {opt.format?.name || 'Standard'}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {comparisonData.comparison_matrix.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                      <td className="p-4 sm:p-5 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-850/40">
                        {row.attribute}
                      </td>
                      {comparisonData.options.map((opt) => (
                        <td key={opt.id} className="p-4 sm:p-5 text-slate-600 dark:text-slate-300 leading-relaxed">
                          {String(row.values[opt.id] ?? 'N/A')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recharts Graphical Visualizer */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Visual Barrier & Sustainability Analytics
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans mt-0.5">
                Relative Protection Metrics (Scaled 1 to 10)
              </h3>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Moisture Barrier" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Oxygen Barrier" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Light Barrier" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Sustainability (1-10)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Verdict Callout */}
          <div className="p-6 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-900/40 text-sm space-y-2">
            <div className="flex items-center gap-2 text-brand-900 dark:text-brand-300 font-bold">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <span>Packaging Engineering Verdict:</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {comparisonData.summary_verdict}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
