import React, { useState, useEffect } from 'react';
import {
  Search, Filter, X, ChevronLeft, ChevronRight, Eye, ShieldCheck,
  AlertTriangle, Droplets, Wind, Sparkles, Scale, Info, CheckCircle2,
  Thermometer, Clock, HelpCircle, ArrowUpDown
} from 'lucide-react';
import { foodService } from '../services/api';
import { FoodTypeSummary, FoodTypeDetail, FoodCategory } from '../types';

interface FoodSearchPageProps {
  initialSearchTerm?: string;
  initialCategoryId?: number;
  onNavigateToRecommendation: (foodName: string) => void;
  onNavigateToComparison: (optionIds: number[], foodId?: number) => void;
}

export const FoodSearchPage: React.FC<FoodSearchPageProps> = ({
  initialSearchTerm = '',
  initialCategoryId,
  onNavigateToRecommendation,
  onNavigateToComparison
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(initialCategoryId);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedMoisture, setSelectedMoisture] = useState<string>('All');
  const [selectedOxygen, setSelectedOxygen] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedTemp, setSelectedTemp] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<string>('asc');

  const [foods, setFoods] = useState<FoodTypeSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [loading, setLoading] = useState(false);

  // Detail Modal State
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
  const [foodDetail, setFoodDetail] = useState<FoodTypeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load Categories on mount
  useEffect(() => {
    foodService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Update from props
  useEffect(() => {
    if (initialSearchTerm) setSearchTerm(initialSearchTerm);
    if (initialCategoryId) setSelectedCategory(initialCategoryId);
  }, [initialSearchTerm, initialCategoryId]);

  // Fetch foods with debounced filter changes
  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const data = await foodService.getFoods({
          q: searchTerm.trim() || undefined,
          category_id: selectedCategory,
          physical_state: selectedState !== 'All' ? selectedState : undefined,
          moisture_level: selectedMoisture !== 'All' ? selectedMoisture : undefined,
          oxygen_sensitivity: selectedOxygen !== 'All' ? selectedOxygen : undefined,
          spoilage_risk: selectedRisk !== 'All' ? selectedRisk : undefined,
          storage_temp: selectedTemp !== 'All' ? selectedTemp : undefined,
          page,
          page_size: pageSize,
          sort_by: sortBy,
          sort_order: sortOrder
        });
        setFoods(data.items);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to fetch food items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [
    searchTerm, selectedCategory, selectedState, selectedMoisture,
    selectedOxygen, selectedRisk, selectedTemp, page, pageSize, sortBy, sortOrder
  ]);

  // Fetch single food detail
  useEffect(() => {
    if (selectedFoodId) {
      setDetailLoading(true);
      foodService.getFoodDetail(selectedFoodId)
        .then(setFoodDetail)
        .catch(console.error)
        .finally(() => setDetailLoading(false));
    } else {
      setFoodDetail(null);
    }
  }, [selectedFoodId]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(undefined);
    setSelectedState('All');
    setSelectedMoisture('All');
    setSelectedOxygen('All');
    setSelectedRisk('All');
    setSelectedTemp('All');
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3">
            <Info className="w-3.5 h-3.5" />
            <span>Extensible Food Dataset (103 Seed Varieties)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Food Search & Packaging Discovery
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Search foods by physical state, spoilage risks, and moisture properties. Inspect candidate barrier packaging options, storage requirements, and validation statuses.
          </p>
        </div>
      </div>

      {/* Main Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by food name or code (e.g., Rice, Coffee, F001)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory || ''}
            onChange={(e) => {
              setSelectedCategory(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
            className="py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.food_count})
              </option>
            ))}
          </select>

          {/* Physical State Dropdown */}
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setPage(1);
            }}
            className="py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="All">All Physical States</option>
            <option value="Solid">Solid</option>
            <option value="Liquid">Liquid</option>
            <option value="Powder">Powder</option>
            <option value="Prepared Meal">Prepared Meal</option>
            <option value="Fresh Produce">Fresh Produce</option>
            <option value="Fresh Meat / Seafood">Fresh Meat / Seafood</option>
            <option value="Frozen">Frozen</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="name">Sort by Name</option>
              <option value="code">Sort by Code</option>
              <option value="category">Sort by Category</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary attribute filter pills */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Moisture:</span>
            {['All', 'High', 'Medium', 'Low'].map((m) => (
              <button
                key={m}
                onClick={() => { setSelectedMoisture(m); setPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedMoisture === m
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Oxygen Sens:</span>
            {['All', 'High', 'Medium', 'Low'].map((o) => (
              <button
                key={o}
                onClick={() => { setSelectedOxygen(o); setPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedOxygen === o
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Spoilage Risk:</span>
            {['All', 'High', 'Medium', 'Low'].map((r) => (
              <button
                key={r}
                onClick={() => { setSelectedRisk(r); setPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedRisk === r
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {(selectedCategory || selectedState !== 'All' || selectedMoisture !== 'All' || selectedOxygen !== 'All' || selectedRisk !== 'All' || searchTerm) && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-900 dark:text-white">{foods.length}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-white">{total}</span> matching food varieties
          </p>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">Searching food database & calculating barrier mappings...</p>
          </div>
        ) : foods.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-sans">No food products found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              No matching records for your current search criteria. Try relaxing your filters or typing a general ingredient name.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => (
              <div
                key={food.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {food.code}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-900">
                      {food.category_name}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 font-sans">
                    {food.name}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      State: {food.physical_state || 'Solid'}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-medium ${
                      food.moisture_level === 'High'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      Moisture: {food.moisture_level || 'Medium'}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-medium ${
                      food.oxygen_sensitivity === 'High'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      O2: {food.oxygen_sensitivity || 'Medium'}
                    </span>
                  </div>

                  {food.candidate_summary && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-400 block font-medium">Candidate Packaging:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold block mt-0.5 line-clamp-2">
                        {food.candidate_summary}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedFoodId(food.id)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Technical Details</span>
                  </button>

                  <button
                    onClick={() => onNavigateToRecommendation(food.name)}
                    className="p-2 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-900 transition-colors"
                    title="Get AI Packaging Recommendation for this food"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Technical Detail Modal */}
      {selectedFoodId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setSelectedFoodId(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {detailLoading || !foodDetail ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading technical food specifications...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-md border border-brand-200/50 dark:border-brand-900">
                      {foodDetail.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Category: {foodDetail.category?.name}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-sans">
                    {foodDetail.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {foodDetail.description}
                  </p>
                </div>

                {/* Characteristics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Moisture Level:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {foodDetail.properties?.moisture_level || 'Medium'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Oxygen Sensitivity:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {foodDetail.properties?.oxygen_sensitivity || 'Medium'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Storage Temp:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                      {foodDetail.properties?.storage_temperature || 'Ambient'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Spoilage Risk:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {foodDetail.properties?.spoilage_risk || 'Medium'}
                    </span>
                  </div>
                </div>

                {/* Spoilage & Quality Risks */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Primary Spoilage Risks & Handling Notes</span>
                  </div>
                  <p className="text-amber-900 dark:text-amber-200 leading-relaxed">
                    {foodDetail.properties?.storage_handling_note || 'Maintain appropriate food safety and temperature control.'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Shelf-Life Expectancy:</strong> {foodDetail.properties?.target_shelf_life_note}
                  </p>
                </div>

                {/* Recommended Packaging Candidate */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Recommended Packaging Candidate
                  </h4>
                  {foodDetail.compatibilities.length > 0 ? (
                    <div className="space-y-4">
                      {foodDetail.compatibilities.map((comp) => {
                        const opt = comp.packaging_option;
                        return (
                          <div
                            key={comp.id}
                            className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  {comp.compatibility_level} ({comp.suitability_score}%)
                                </span>
                                <h5 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                                  {opt?.name}
                                </h5>
                              </div>
                              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                                {opt?.estimated_unit_cost_range}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {comp.reasons || opt?.description}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
                              <div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Advantages:</span>
                                <p className="text-slate-500 dark:text-slate-400 mt-0.5">{comp.key_advantages}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Technical Tests Required:</span>
                                <p className="text-slate-500 dark:text-slate-400 mt-0.5">{comp.required_tests}</p>
                              </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                              <span>Evidence: {comp.evidence_level}</span>
                              <span className="font-semibold uppercase text-brand-600 dark:text-brand-400">
                                Status: {comp.validation_status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                      Packaging requirements: {foodDetail.packaging_requirements?.requirements_text}
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      const foodId = foodDetail.id;
                      const optIds = foodDetail.compatibilities.map(c => c.packaging_option?.id).filter(Boolean) as number[];
                      setSelectedFoodId(null);
                      if (optIds.length > 0) {
                        onNavigateToComparison(optIds, foodId);
                      } else {
                        onNavigateToComparison([1, 2], foodId);
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
                  >
                    <Scale className="w-4 h-4" />
                    <span>Compare Packaging Options</span>
                  </button>

                  <button
                    onClick={() => {
                      const name = foodDetail.name;
                      setSelectedFoodId(null);
                      onNavigateToRecommendation(name);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Run Custom AI Recommendation</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
