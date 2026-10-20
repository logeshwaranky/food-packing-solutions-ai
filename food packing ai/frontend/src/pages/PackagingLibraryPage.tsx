import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Filter, Search, ChevronRight, Layers, CheckCircle2,
  AlertTriangle, DollarSign, Wrench, Leaf, Truck, BookOpen, ExternalLink,
  Scale
} from 'lucide-react';
import { packagingService } from '../services/api';
import { PackagingMethod, PackagingMaterial } from '../types';

interface PackagingLibraryPageProps {
  onSelectCompare: (methodOptionId: number) => void;
  initialMethodId?: number;
}

export const PackagingLibraryPage: React.FC<PackagingLibraryPageProps> = ({
  onSelectCompare,
  initialMethodId
}) => {
  const [methods, setMethods] = useState<PackagingMethod[]>([]);
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'methods' | 'materials'>('methods');
  const [selectedMethod, setSelectedMethod] = useState<PackagingMethod | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [methData, matData] = await Promise.all([
          packagingService.getMethods(),
          packagingService.getMaterials()
        ]);
        setMethods(methData);
        setMaterials(matData);

        if (initialMethodId) {
          const match = methData.find((m) => m.id === initialMethodId);
          if (match) setSelectedMethod(match);
        }
      } catch (err) {
        console.error('Error fetching packaging library:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialMethodId]);

  const categories = ['All', 'Atmospheric Control', 'Thermal Sterilization', 'Rigid', 'Flexible', 'Cellulose-Based', 'Active / Smart', 'Bio-Based Protection', 'Cold Chain Solutions', 'Circular Solutions'];

  const filteredMethods = methods.filter((m) => {
    const matchesCat = selectedCategory === 'All' || m.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery = !searchQuery.trim() ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.how_it_works.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.food_applications.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredMaterials = materials.filter((mat) => {
    return !searchQuery.trim() ||
      mat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mat.format_type && mat.format_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (mat.typical_examples && mat.typical_examples.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Comprehensive Technical Repository</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Packaging Methods & Materials Library
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Distinguishing <strong>packaging methods (processes)</strong> from <strong>substrate materials</strong>. Learn operating mechanisms, barriers, equipment, and validation protocols.
          </p>
        </div>

        {/* Tab switch */}
        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('methods')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'methods'
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            16 Packaging Methods (Processes)
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'materials'
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Substrate Materials & Polymers ({materials.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'methods' ? 'methods, applications...' : 'materials, polymers...'}`}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        {activeTab === 'methods' && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading packaging engineering specifications...</p>
        </div>
      ) : activeTab === 'methods' ? (
        /* METHODS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethods.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-lg hover:border-brand-500/60 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded border border-brand-200/50 dark:border-brand-900">
                    {m.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Process / Method
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3 font-sans group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {m.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {m.how_it_works}
                </p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block font-medium">Food Protection Mechanism:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold block mt-0.5 line-clamp-2">
                      {m.food_protection_mechanism}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Cost Level: <strong>{m.cost_category || 'Moderate'}</strong></span>
                  <span>{m.category}</span>
                </div>

                <button
                  onClick={() => setSelectedMethod(m)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Inspect Technical Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* MATERIALS TABLE / GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {mat.code}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Material Substrate
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 font-sans">
                  {mat.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Format: {mat.format_type}
                </p>

                {/* Barrier ratings */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Moisture</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{mat.moisture_barrier}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Oxygen</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{mat.oxygen_barrier}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Light</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{mat.light_barrier}</span>
                  </div>
                </div>

                <div className="mt-4 text-xs space-y-2">
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Typical Uses:</strong> {mat.typical_examples}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    <strong>Recyclability / Circularity:</strong> {mat.recyclability_status}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                <span>Note: {mat.design_validation_note}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Method Modal */}
      {selectedMethod && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative space-y-6">
            <button
              onClick={() => setSelectedMethod(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded">
                  {selectedMethod.code}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Method / Process
                </span>
                <span className="text-xs text-slate-400">Category: {selectedMethod.category}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-sans">
                {selectedMethod.name}
              </h2>
            </div>

            {/* How It Works */}
            <div className="space-y-1 text-sm">
              <h4 className="font-bold text-slate-900 dark:text-white">Operating Principle & Technology:</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedMethod.how_it_works}</p>
            </div>

            {/* Food Protection Mechanism */}
            <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/70 dark:border-brand-900/40 text-sm space-y-1">
              <h4 className="font-bold text-brand-900 dark:text-brand-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Food Protection Mechanism</span>
              </h4>
              <p className="text-brand-950 dark:text-brand-200 leading-relaxed">{selectedMethod.food_protection_mechanism}</p>
            </div>

            {/* Advantages and Limitations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Advantages</span>
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedMethod.advantages}</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Limitations & Caveats</span>
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedMethod.limitations}</p>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Equipment Requirements:</span>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{selectedMethod.equipment_requirements || 'Standard packaging machinery'}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Safety & Validation Testing:</span>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{selectedMethod.safety_validation_requirements || 'Physical seal & migration testing required'}</p>
              </div>
              <div className="mt-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Logistics & Storage:</span>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{selectedMethod.storage_transport_suitability}</p>
              </div>
              <div className="mt-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Circularity & Environmental:</span>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{selectedMethod.environmental_considerations}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMethod(null)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
