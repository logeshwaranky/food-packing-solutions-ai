import React, { useState, useEffect } from 'react';
import {
  Search, Sparkles, ArrowRight, ShieldCheck, Droplets, Wind,
  Sun, CheckCircle2, AlertTriangle, Layers, Box, Cpu, FileCheck2,
  ChevronRight, Utensils, Apple, Coffee, Milk, Flame
} from 'lucide-react';
import { foodService, packagingService } from '../services/api';
import { FoodCategory, PackagingMethod } from '../types';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  onSearchFood: (term: string) => void;
  onSelectCategory: (categoryId: number) => void;
  onSelectMethod: (methodId: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActiveTab,
  onSearchFood,
  onSelectCategory,
  onSelectMethod
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [popularMethods, setPopularMethods] = useState<PackagingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, meths] = await Promise.all([
          foodService.getCategories(),
          packagingService.getMethods()
        ]);
        setCategories(cats.slice(0, 8));
        setPopularMethods(meths.slice(0, 4));
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const timer = setTimeout(async () => {
        try {
          const res = await foodService.searchSuggestions(searchTerm);
          setSuggestions(res.slice(0, 5));
        } catch (e) {
          setSuggestions([]);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearchFood(searchTerm.trim());
      setActiveTab('foods');
    }
  };

  const samplePills = [
    { label: 'Ground Coffee', query: 'Coffee' },
    { label: 'Biryani Takeaway', query: 'Biryani' },
    { label: 'Pasteurized Milk', query: 'Milk' },
    { label: 'Fresh Apples', query: 'Apple' },
    { label: 'Potato Chips', query: 'Potato crisps' },
    { label: 'Fresh Poultry', query: 'Chicken' },
  ];

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('meal') || n.includes('prepared')) return Utensils;
    if (n.includes('produce') || n.includes('fruit')) return Apple;
    if (n.includes('beverage') || n.includes('drink')) return Coffee;
    if (n.includes('dairy')) return Milk;
    if (n.includes('fried') || n.includes('snack')) return Flame;
    return Box;
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/20 to-teal-400/20 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/80 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-pulse" />
            <span>AI-Powered Food Science & Packaging Engineering</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans leading-tight">
            Find the Right Packaging <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              for Every Food Product
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Protect food freshness, extend shelf life, and comply with safety regulations. Explore candidate packaging materials, processes, and barrier technologies backed by transparent engineering evidence.
          </p>

          {/* Interactive Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="absolute left-4 text-slate-400 pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search any food product (e.g. Coffee powder, Biryani, Salmon, Milk)..."
                className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-brand-500 dark:focus:border-brand-500 text-slate-900 dark:text-white placeholder-slate-400 shadow-xl shadow-slate-200/50 dark:shadow-none focus:outline-none transition-all text-base"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                Search
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-30 text-left">
                <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider px-4">
                  Matching Foods in Catalogue
                </div>
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSearchFood(item.name);
                      setActiveTab('foods');
                    }}
                    className="px-4 py-3 hover:bg-brand-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{item.name}</span>
                      <span className="text-xs text-slate-400 ml-2">({item.code})</span>
                    </div>
                    {item.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick Pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-slate-400 mr-1 font-medium">Popular:</span>
              {samplePills.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSearchFood(p.query);
                    setActiveTab('foods');
                  }}
                  className="px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-brand-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors shadow-sm"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('recommendation')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-brand-600/30 hover:shadow-brand-600/40 transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Launch AI Recommendation Assistant</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-800 transition-all shadow-sm"
            >
              Explore 16 Packaging Methods
            </button>
          </div>
        </div>
      </section>

      {/* 2. HOW THE AI ENGINE WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-brand-600 dark:text-brand-400">
            Explainable Methodology
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-sans">
            How the AI Recommendation Engine Works
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Transparent multi-stage evaluation. Food safety and contact compliance always precede cost, speed, or sustainability scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Product Ingestion & NLP',
              desc: 'Extracts physical state, moisture activity, fat levels, oxygen and aroma sensitivity from natural-language or structured inputs.',
              icon: Cpu,
              color: 'from-blue-500 to-indigo-600'
            },
            {
              step: '02',
              title: 'Mandatory Safety Gate',
              desc: 'Hard filters eliminate hazardous combinations (e.g. anaerobic vacuum on respiring produce or non-sterile ambient high-moisture meals).',
              icon: ShieldCheck,
              color: 'from-emerald-500 to-teal-600'
            },
            {
              step: '03',
              title: 'Multi-Attribute Barrier Fit',
              desc: 'Calculates quantitative adequacy for WVTR, OTR, UV opacity, mechanical rigidity, and temperature tolerance curves.',
              icon: Layers,
              color: 'from-amber-500 to-orange-600'
            },
            {
              step: '04',
              title: 'Validation & Testing Evidence',
              desc: 'Generates ranked candidates with trade-offs, missing data notices, and recommended laboratory test standards (ASTM/ISO).',
              icon: FileCheck2,
              color: 'from-purple-500 to-pink-600'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl font-extrabold text-slate-200 dark:text-slate-800 font-mono absolute top-4 right-4">
                  {item.step}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white mb-5 shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. POPULAR FOOD CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-brand-600 dark:text-brand-400">
              Extensible Food Catalogue
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-sans">
              Popular Food Categories
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select a category to discover specific food varieties and candidate packaging.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('foods')}
            className="mt-4 sm:mt-0 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1"
          >
            <span>View All Food Records</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            return (
              <div
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setActiveTab('foods');
                }}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500/80 cursor-pointer shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {cat.description || 'Specialized barrier and temperature requirements.'}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/40 px-2 py-0.5 rounded-full">
                    {cat.food_count || 1} varieties
                  </span>
                  <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. POPULAR PACKAGING METHODS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-brand-600 dark:text-brand-400">
              Packaging Science Library
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-sans">
              Core Packaging Methods & Processes
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Explore methods engineered to preserve organoleptic quality and microbial safety.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('library')}
            className="mt-4 sm:mt-0 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1"
          >
            <span>Explore All 16 Methods</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {popularMethods.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                onSelectMethod(m.id);
                setActiveTab('library');
              }}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 cursor-pointer shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-brand-600 dark:text-brand-400 font-bold bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
                    {m.code}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {m.name}
                  </h3>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {m.category || 'Packaging Method'}
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                {m.how_it_works}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Key Food Target:</span>
                  <span className="text-slate-700 dark:text-slate-200 font-semibold truncate block mt-0.5">
                    {m.food_applications}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Cost Level:</span>
                  <span className="text-slate-700 dark:text-slate-200 font-semibold block mt-0.5">
                    {m.cost_category || 'Moderate'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. BENEFITS OF FOOD PACKAGING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-brand-950 text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-400">
              Why Packaging Matters
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 font-sans">
              The Essential Pillars of Modern Food Packaging
            </h2>
            <p className="text-slate-300 mt-4 text-base leading-relaxed">
              Proper packaging protects nutrition, halts microbial spoilage, prevents food waste across supply chains, and connects producers to global markets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {[
              {
                title: 'Extended Shelf Life',
                desc: 'Slows lipid oxidation, halts staling, and delays enzymatic decay through calibrated atmospheric gas barriers.',
                icon: ShieldCheck
              },
              {
                title: 'Food Waste Reduction',
                desc: 'Over 30% of global food is lost post-harvest. Precision barrier packaging prevents premature spoilage.',
                icon: CheckCircle2
              },
              {
                title: 'Contamination Shield',
                desc: 'Hermetic seals block airborne microbes, dust, pest burrowing, and accidental chemical cross-contamination.',
                icon: Droplets
              },
              {
                title: 'Logistics Integrity',
                desc: 'Cushions against mechanical vibrations, drop shocks, and crushing throughout multi-modal transport.',
                icon: Box
              }
            ].map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base mb-1">{b.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Packaging cannot compensate for unhygienic raw materials or broken cold-chain handling.</span>
            </div>
            <button
              onClick={() => setActiveTab('protection')}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-colors shadow-md"
            >
              Read Food Protection Guide
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
