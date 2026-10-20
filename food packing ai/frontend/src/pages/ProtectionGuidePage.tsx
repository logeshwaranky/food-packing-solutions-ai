import React, { useState, useEffect } from 'react';
import {
  BookOpen, Droplets, Wind, Sun, ShieldAlert, Box,
  Pipette, Sparkles, ThermometerSnowflake, Bug, CheckCircle2,
  AlertTriangle, ArrowRight, ShieldCheck, Layers, ChevronRight
} from 'lucide-react';
import { guideService } from '../services/api';
import { ProtectionGuide } from '../types';

interface ProtectionGuidePageProps {
  onSelectPackagingMethod: (methodCode: string) => void;
}

export const ProtectionGuidePage: React.FC<ProtectionGuidePageProps> = () => {
  const [guides, setGuides] = useState<ProtectionGuide[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState<string>('moisture-gain-and-loss');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guideService.getGuides()
      .then((data) => {
        setGuides(data);
        if (data.length > 0) setSelectedGuideId(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getVectorIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets': return Droplets;
      case 'Wind': return Wind;
      case 'Sun': return Sun;
      case 'ShieldAlert': return ShieldAlert;
      case 'Box': return Box;
      case 'Pipette': return Pipette;
      case 'Sparkles': return Sparkles;
      case 'ThermometerSnowflake': return ThermometerSnowflake;
      case 'Bug': return Bug;
      default: return ShieldCheck;
    }
  };

  const currentGuide = guides.find((g) => g.id === selectedGuideId) || guides[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Food Science & Degradation Physics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Food Protection & Spoilage Guide
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Understand how packaging acts as a physical and chemical barrier against the 9 primary vectors of food deterioration.
          </p>
        </div>
      </div>

      {/* Mandatory Safety Notice Alert */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3.5 shadow-sm">
        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed space-y-1">
          <p className="font-bold text-amber-800 dark:text-amber-300">
            CRITICAL FOOD SAFETY PRINCIPLE: PACKAGING ALONE CANNOT MAKE UNSAFE FOOD SAFE
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            Packaging acts as an environmental barrier to preserve quality achieved during primary processing. It cannot undo existing microbiological contamination, restore decomposed nutrients, or replace temperature-controlled cold chain logistics (0–4°C / –18°C).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading food protection guides...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Navigation: 9 Vectors */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-2 mb-2">
              The 9 Degradation Vectors
            </span>

            <div className="space-y-1.5">
              {guides.map((g) => {
                const Icon = getVectorIcon(g.icon);
                const isSelected = g.id === selectedGuideId;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGuideId(g.id)}
                    className={`w-full text-left p-3.5 rounded-2xl font-medium text-xs sm:text-sm transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-bold'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{g.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detail Panel */}
          {currentGuide && (
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-9 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 font-mono">
                  Degradation Vector Analysis
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-sans">
                  {currentGuide.title}
                </h2>
              </div>

              {/* What Causes The Problem */}
              <div className="space-y-1 text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                  <span>Root Causes:</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-4">
                  {currentGuide.causes}
                </p>
              </div>

              {/* How It Affects Food */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-sm space-y-1">
                <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>How It Degrades Food Quality & Safety:</span>
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                  {currentGuide.effects_on_food}
                </p>
              </div>

              {/* Packaging Properties That Help */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-sm space-y-1">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Counteracting Packaging Barrier Properties:</span>
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                  {currentGuide.packaging_properties}
                </p>
              </div>

              {/* Suitable Packaging Methods */}
              <div className="space-y-2 text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>Recommended Packaging Methods & Technologies:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-6">
                  {currentGuide.suitable_methods.map((meth, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-2"
                    >
                      <span className="text-brand-500 font-bold">•</span>
                      <span>{meth}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Limitations & Handling Practices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Technical Limitations:</span>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{currentGuide.limitations}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Required Storage & Handling Practices:</span>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{currentGuide.storage_handling_practices}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
