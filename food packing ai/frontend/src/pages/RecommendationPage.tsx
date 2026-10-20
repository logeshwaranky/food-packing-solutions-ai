import React, { useState, useEffect } from 'react';
import {
  Sparkles, Send, ShieldCheck, AlertTriangle, ArrowRight, Layers,
  CheckCircle2, Scale, RefreshCw, Star, Info, MessageSquare,
  HelpCircle, ChevronDown, Check, Sliders
} from 'lucide-react';
import { recommendationService, feedbackService, foodService } from '../services/api';
import { RecommendationResponse, FoodCategory } from '../types';

interface RecommendationPageProps {
  initialFoodName?: string;
  onNavigateToComparison: (optionIds: number[], foodId?: number) => void;
}

export const RecommendationPage: React.FC<RecommendationPageProps> = ({
  initialFoodName = '',
  onNavigateToComparison
}) => {
  const [mode, setMode] = useState<'nlp' | 'wizard'>('nlp');
  const [query, setQuery] = useState(
    initialFoodName
      ? `I want to package ${initialFoodName}. It needs adequate barrier protection, long shelf life, and affordable unit cost.`
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);

  // Wizard state
  const [wizardFood, setWizardFood] = useState(initialFoodName);
  const [wizardQty, setWizardQty] = useState('250 g');
  const [wizardMoisture, setWizardMoisture] = useState('High');
  const [wizardFat, setWizardFat] = useState('Medium');
  const [wizardOxygen, setWizardOxygen] = useState('High');
  const [wizardLight, setWizardLight] = useState('Medium');
  const [wizardAroma, setWizardAroma] = useState('High');
  const [wizardTemp, setWizardTemp] = useState('Ambient');
  const [wizardShelfLife, setWizardShelfLife] = useState('Medium (1-6 months)');
  const [wizardBudget, setWizardBudget] = useState('Economy / Affordable');
  const [wizardSust, setWizardSust] = useState('Standard');

  // Feedback state
  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Preset realistic prompt scenarios
  const promptPresets = [
    {
      title: 'Ground Coffee (250g)',
      text: 'I want to pack 250 g of coffee powder. It should retain its aroma, remain protected from moisture and oxygen, and be affordable.'
    },
    {
      title: 'Hot Biryani Takeaway',
      text: 'Need a leak-proof, grease-resistant takeaway container for hot biryani (500 g) delivered within 45 minutes.'
    },
    {
      title: 'Chilled Salmon Fillet (14 Days)',
      text: 'Packaging for fresh chilled salmon fillets (300 g) requiring 14 days shelf life at 0-2°C without purge leakage.'
    },
    {
      title: 'Crispy Potato Chips',
      text: 'Pack 100 g of crunchy potato chips with high grease and moisture sensitivity, maintaining crispness for 6 months.'
    },
    {
      title: 'Pasteurized Liquid Milk (1L)',
      text: 'I want to pack 1 liter of fresh pasteurized milk for refrigerated retail distribution.'
    }
  ];

  const handleRunNlp = async (promptText?: string) => {
    const textToRun = promptText || query;
    if (!textToRun.trim()) return;

    setLoading(true);
    setFeedbackSubmitted(false);
    try {
      const res = await recommendationService.getRecommendations({ query: textToRun });
      setResponse(res);
    } catch (err) {
      console.error('Recommendation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunWizard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackSubmitted(false);
    try {
      const res = await recommendationService.getRecommendations({
        food_name: wizardFood || undefined,
        quantity: wizardQty,
        moisture_level: wizardMoisture,
        fat_oil_content: wizardFat,
        oxygen_sensitivity: wizardOxygen,
        light_sensitivity: wizardLight,
        aroma_sensitivity: wizardAroma,
        storage_temperature: wizardTemp,
        target_shelf_life: wizardShelfLife,
        budget: wizardBudget,
        sustainability_preference: wizardSust
      });
      setResponse(res);
    } catch (err) {
      console.error('Wizard recommendation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feedbackService.submitFeedback({
        rating,
        comments: feedbackComment,
        selected_packaging_id: response?.candidates[0]?.option_id
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Feedback submission failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Dual-Mode AI Packaging Engineer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            AI Packaging Recommendation Assistant
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Submit a natural-language description or complete our guided engineering wizard. The AI applies <strong>mandatory food contact safety gates</strong> before ranking candidates by barrier adequacy and economics.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={() => setMode('nlp')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              mode === 'nlp'
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Natural-Language Assistant</span>
          </button>
          <button
            onClick={() => setMode('wizard')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              mode === 'wizard'
                ? 'bg-brand-500 text-slate-950 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Guided Engineering Wizard</span>
          </button>
        </div>
      </div>

      {/* Input Section */}
      {mode === 'nlp' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              Describe your food packaging requirements in plain English:
            </label>
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                placeholder="e.g., I want to pack 250 g of coffee powder. It should retain its aroma, remain protected from moisture and oxygen, and be affordable."
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm sm:text-base leading-relaxed"
              />
              <button
                onClick={() => handleRunNlp()}
                disabled={loading || !query.trim()}
                className="mt-3 sm:mt-0 sm:absolute sm:right-3 sm:bottom-4 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-200" />
                )}
                <span>Evaluate Packaging Candidates</span>
              </button>
            </div>
          </div>

          {/* Quick Scenario Pills */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Try Sample Food Scenarios:
            </span>
            <div className="flex flex-wrap gap-2">
              {promptPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(p.text);
                    handleRunNlp(p.text);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors text-left"
                >
                  <span className="font-semibold text-brand-600 dark:text-brand-400 mr-1.5">⚡</span>
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* GUIDED ENGINEERING WIZARD */
        <form onSubmit={handleRunWizard} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Food Product Name / Ingredients:
              </label>
              <input
                type="text"
                value={wizardFood}
                onChange={(e) => setWizardFood(e.target.value)}
                placeholder="e.g. Ground coffee, Biryani, Fresh fish"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Package Net Weight / Volume:
              </label>
              <input
                type="text"
                value={wizardQty}
                onChange={(e) => setWizardQty(e.target.value)}
                placeholder="e.g. 250 g, 500 ml, 1 kg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Moisture Level:
              </label>
              <select
                value={wizardMoisture}
                onChange={(e) => setWizardMoisture(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="High">High Moisture (Wet / Fresh / Liquid)</option>
                <option value="Medium">Medium Moisture (Semi-moist, sauces)</option>
                <option value="Low">Low Moisture (Crisp, dry powders)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Oxygen Sensitivity:
              </label>
              <select
                value={wizardOxygen}
                onChange={(e) => setWizardOxygen(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="High">High (Fats, coffee, nuts, red meat)</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low (Sugar, salt, dry pasta)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Aroma & Flavor Retention:
              </label>
              <select
                value={wizardAroma}
                onChange={(e) => setWizardAroma(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="High">Critical (Coffee, spices, tea)</option>
                <option value="Medium">Medium</option>
                <option value="Low">Standard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Storage Temperature:
              </label>
              <select
                value={wizardTemp}
                onChange={(e) => setWizardTemp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="Ambient">Ambient Room Temp (15-25°C)</option>
                <option value="Refrigerated (0-4°C)">Refrigerated (0-4°C)</option>
                <option value="Frozen (-18°C)">Frozen (-18°C)</option>
                <option value="Hot Holding (>60°C)">Hot Holding (&gt;60°C Takeaway)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Shelf Life:
              </label>
              <select
                value={wizardShelfLife}
                onChange={(e) => setWizardShelfLife(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="Short (<7-14 days)">Short (&lt;7-14 days delivery)</option>
                <option value="Medium (1-6 months)">Medium (1-6 months retail)</option>
                <option value="Extended (>6-12 months)">Extended (&gt;6-12 months ambient)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Budget Level:
              </label>
              <select
                value={wizardBudget}
                onChange={(e) => setWizardBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="Economy / Affordable">Economy / Affordable (Low cost/unit)</option>
                <option value="Balanced / Standard">Balanced / Standard</option>
                <option value="Premium">Premium / High Value</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Sustainability Preference:
              </label>
              <select
                value={wizardSust}
                onChange={(e) => setWizardSust(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="Standard">Standard Circularity</option>
                <option value="High (Recyclable / Compostable)">High (Mono-material / Compostable)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center gap-2 shadow"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Candidate Recommendations</span>
            </button>
          </div>
        </form>
      )}

      {/* RESULTS DISPLAY */}
      {response && (
        <div className="space-y-8 animate-fadeIn">
          {/* Extracted Criteria & Safety Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Analysis Summary</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans mt-0.5">
                  Target: {response.extracted_criteria.detected_food || 'Food Product'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/50">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mandatory Safety Gates Passed</span>
                </span>
                <span className="text-xs text-slate-400">
                  ({response.disqualified_candidates_count} hazardous options eliminated)
                </span>
              </div>
            </div>

            {/* Criteria Badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              {response.extracted_criteria.quantity && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Quantity: <strong>{response.extracted_criteria.quantity}</strong>
                </span>
              )}
              {response.extracted_criteria.physical_state && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  State: <strong>{response.extracted_criteria.physical_state}</strong>
                </span>
              )}
              {response.extracted_criteria.moisture_sensitivity && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  Moisture: <strong>{response.extracted_criteria.moisture_sensitivity}</strong>
                </span>
              )}
              {response.extracted_criteria.oxygen_sensitivity && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  O2 Sens: <strong>{response.extracted_criteria.oxygen_sensitivity}</strong>
                </span>
              )}
              {response.extracted_criteria.aroma_sensitivity && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  Aroma: <strong>{response.extracted_criteria.aroma_sensitivity}</strong>
                </span>
              )}
              {response.extracted_criteria.storage_temperature && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  Temp: <strong>{response.extracted_criteria.storage_temperature}</strong>
                </span>
              )}
            </div>

            {/* Follow-up Prompts if missing information */}
            {response.missing_information_prompts.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>Important Clarifications & Missing Technical Data:</span>
                </span>
                <ul className="list-disc list-inside space-y-0.5 pl-2 text-slate-700 dark:text-slate-300">
                  {response.missing_information_prompts.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Ranked Candidates Cards */}
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-sans">
              Ranked Packaging Candidates ({response.candidates.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {response.candidates.map((cand, idx) => (
                <div
                  key={cand.option_id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border-2 border-slate-200/80 dark:border-slate-800 hover:border-brand-500 shadow-md flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                            Rank #{idx + 1} Candidate
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {cand.format_name}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 font-sans">
                          {cand.name}
                        </h4>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-black text-brand-600 dark:text-brand-400 font-mono">
                          {cand.overall_suitability_score}%
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Suitability</span>
                      </div>
                    </div>

                    {/* Technical rationale */}
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong>Why Candidate:</strong> {cand.why_candidate}
                    </p>

                    {/* Key Advantages */}
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                        Key Advantages for this Food:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {cand.advantages.map((adv, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Trade-offs & Caveats */}
                    <div>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-1.5">
                        Engineering Trade-offs & Limitations:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {cand.trade_offs.map((to, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{to}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Technical Tests */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-400 block font-medium">Recommended Laboratory Standards:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {cand.recommended_technical_tests.map((test, testIdx) => (
                          <span
                            key={testIdx}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px]"
                          >
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Est. Unit Cost: <strong>{cand.estimated_unit_cost || 'N/A'}</strong>
                    </span>
                    <button
                      onClick={() => {
                        const otherIds = response.candidates
                          .filter((c) => c.option_id !== cand.option_id)
                          .map((c) => c.option_id)
                          .slice(0, 2);
                        onNavigateToComparison([cand.option_id, ...otherIds], response.extracted_criteria.matched_food_id);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Compare with Alternatives</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Disclaimer Banner */}
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Technical & Regulatory Disclaimer:</strong> {response.regulatory_disclaimer}
            </div>
          </div>

          {/* User Feedback Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-xl mx-auto">
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-sans text-center">
              Was this packaging recommendation helpful?
            </h4>
            <p className="text-xs text-slate-500 text-center mt-1">
              Your feedback refines our multi-attribute rules and testing priorities.
            </p>

            {feedbackSubmitted ? (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-center text-xs font-semibold">
                Thank you! Your feedback has been recorded for our packaging specialists.
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Optional notes or supplier requirements..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow"
                >
                  Submit Recommendation Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
