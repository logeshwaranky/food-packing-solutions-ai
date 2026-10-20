import React from 'react';
import { Package, ShieldAlert, ExternalLink, Mail, Info, FileText } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white font-sans">
                Food Packing <span className="text-brand-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Intelligent, explainable food packaging decision-support system bridging food science, barrier polymer engineering, and regulatory safety standards.
            </p>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Database Seed: 103 Food Varieties & 20 Materials
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setActiveTab('foods')} className="hover:text-brand-400 transition-colors">
                  Food Search & Discovery
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('library')} className="hover:text-brand-400 transition-colors">
                  16 Packaging Methods Library
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('recommendation')} className="hover:text-brand-400 transition-colors">
                  AI Recommendation Assistant
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('protection')} className="hover:text-brand-400 transition-colors">
                  Food Protection Guide (9 Vectors)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('comparison')} className="hover:text-brand-400 transition-colors">
                  Side-by-Side Packaging Comparison
                </button>
              </li>
            </ul>
          </div>

          {/* Regulatory & Standards */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>Standards & Protocols</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <span className="text-brand-400 font-mono font-bold">•</span>
                <span>US FDA 21 CFR Parts 170-199 (Food Contact Substances)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-brand-400 font-mono font-bold">•</span>
                <span>Regulation (EU) No 10/2011 (Plastic Materials Migration)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-brand-400 font-mono font-bold">•</span>
                <span>ASTM D3985 / ASTM F1249 (Coulometric OTR & WVTR Testing)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-brand-400 font-mono font-bold">•</span>
                <span>ISO 22000 & HACCP Preventive Safety Principles</span>
              </li>
            </ul>
          </div>

          {/* Regulatory Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Safety & Legal Notice</span>
            </h4>
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/80 text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>
                <strong>Educational Decision Support:</strong> Recommendations do not constitute legal certification or guaranteed shelf-life.
              </p>
              <p>
                Packaging alone cannot make unsafe food safe. Proper thermal processing, cold chain adherence (0-4°C / -18°C), and migration validation (EN 1186) remain mandatory.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Food Packing Solutions AI. Built for Food Scientists, Manufacturers & Students.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Version 1.0.0 (Production Architecture)</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
