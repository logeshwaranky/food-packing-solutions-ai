import React, { useState, useEffect } from 'react';
import {
  Lock, User, LogOut, UploadCloud, Database, Plus, CheckCircle2,
  AlertTriangle, RefreshCw, BarChart2, Star, ShieldCheck, FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { adminService, foodService, packagingService } from '../services/api';
import { AdminStats, FoodCategory, PackagingOption } from '../types';

interface AdminPageProps {
  onLogout: () => void;
  onLoginSuccess: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onLogout, onLoginSuccess }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('foodpack_token'));
  const [userProfile, setUserProfile] = useState<any>(null);

  // Login form state
  const [email, setEmail] = useState('admin@foodpackai.com');
  const [password, setPassword] = useState('admin_secure_password_2026');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin dashboard state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [options, setOptions] = useState<PackagingOption[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'add_food' | 'import_dataset'>('overview');

  // Add food form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number>(1);
  const [newState, setNewState] = useState('Solid');
  const [newMoisture, setNewMoisture] = useState('Medium');
  const [newOxygen, setNewOxygen] = useState('Medium');
  const [newRisk, setNewRisk] = useState('Medium');
  const [newTemp, setNewTemp] = useState('Ambient');
  const [newRequirements, setNewRequirements] = useState('');
  const [newOptionId, setNewOptionId] = useState<number>(1);
  const [formMsg, setFormMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      adminService.getMe()
        .then((u) => {
          setUserProfile(u);
          onLoginSuccess();
        })
        .catch(() => {
          handleLogout();
        });

      loadStatsAndMetadata();
    }
  }, [token]);

  const loadStatsAndMetadata = async () => {
    try {
      const [s, cats, opts] = await Promise.all([
        adminService.getStats(),
        foodService.getCategories(),
        packagingService.getOptions()
      ]);
      setStats(s);
      setCategories(cats);
      setOptions(opts);
      if (cats.length > 0) setNewCategoryId(cats[0].id);
      if (opts.length > 0) setNewOptionId(opts[0].id);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await adminService.login(email, password);
      localStorage.setItem('foodpack_token', res.access_token);
      setToken(res.access_token);
      setUserProfile({ email, full_name: res.user_name, role: res.role });
      onLoginSuccess();
    } catch (err: any) {
      setLoginError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('foodpack_token');
    setToken(null);
    setUserProfile(null);
    onLogout();
  };

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    try {
      await adminService.createFood({
        code: newCode,
        name: newName,
        category_id: newCategoryId,
        physical_state: newState,
        moisture_level: newMoisture,
        oxygen_sensitivity: newOxygen,
        spoilage_risk: newRisk,
        storage_temperature: newTemp,
        packaging_requirements: newRequirements,
        packaging_option_id: newOptionId
      });
      setFormMsg({ text: `Food record "${newName}" successfully created with verified packaging mapping!`, type: 'success' });
      setNewCode('');
      setNewName('');
      setNewRequirements('');
      loadStatsAndMetadata();
    } catch (err: any) {
      setFormMsg({ text: err.response?.data?.detail || 'Failed to create food item.', type: 'error' });
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImportLoading(true);
    setImportResult(null);
    try {
      const res = await adminService.importDataset(importFile);
      setImportResult(res.message);
      loadStatsAndMetadata();
    } catch (err: any) {
      setImportResult(err.response?.data?.detail || 'Import failed. Check file format.');
    } finally {
      setImportLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
              Admin & Specialist Access
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with administrative credentials to manage datasets, tests, and food mappings.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admin Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
              <p><strong>Default Seed Credentials:</strong></p>
              <p>Email: <code className="text-brand-600">admin@foodpackai.com</code></p>
              <p>Password: <code className="text-brand-600">admin_secure_password_2026</code></p>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-colors shadow flex items-center justify-center gap-2"
            >
              {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Sign In to Admin Portal</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Logout */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticated Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-sans">
            Dataset & Packaging Governance
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as <strong>{userProfile?.full_name || userProfile?.email}</strong> (Role: {userProfile?.role || 'admin'})
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'System Overview & Metrics', icon: BarChart2 },
          { id: 'add_food', label: 'Add Food Record', icon: Plus },
          { id: 'import_dataset', label: 'Import Excel / CSV Dataset', icon: FileSpreadsheet },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Food Varieties', val: stats.total_foods, color: 'text-brand-600' },
              { label: 'Categories', val: stats.total_categories, color: 'text-teal-600' },
              { label: 'Packaging Methods', val: stats.total_packaging_methods, color: 'text-blue-600' },
              { label: 'Materials Substrates', val: stats.total_materials, color: 'text-indigo-600' },
              { label: 'Packaging Options', val: stats.total_options, color: 'text-purple-600' },
              { label: 'Standard Tests', val: stats.total_tests, color: 'text-emerald-600' },
            ].map((s, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-400 font-medium block">{s.label}</span>
                <span className={`text-2xl sm:text-3xl font-extrabold ${s.color} font-mono mt-1 block`}>
                  {s.val}
                </span>
              </div>
            ))}
          </div>

          {/* Validation Status Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
              Validation & Compliance Audit Status Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(stats.validation_status_breakdown || {}).map(([key, count]) => (
                <div key={key} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 uppercase">{key}</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADD FOOD RECORD */}
      {activeTab === 'add_food' && (
        <form onSubmit={handleAddFood} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
              Add New Food Variety to Database
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a new food item with properties and map it to a candidate packaging option.
            </p>
          </div>

          {formMsg && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950' : 'bg-red-50 text-red-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{formMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Food Code (e.g. F104):</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="F104"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Food Name:</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Organic Almond Butter"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Food Category:</label>
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Physical State:</label>
              <select
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="Solid">Solid</option>
                <option value="Liquid">Liquid</option>
                <option value="Powder">Powder</option>
                <option value="Prepared Meal">Prepared Meal</option>
                <option value="Fresh Produce">Fresh Produce</option>
                <option value="Fresh Meat / Seafood">Fresh Meat / Seafood</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Moisture Level:</label>
              <select
                value={newMoisture}
                onChange={(e) => setNewMoisture(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Oxygen Sensitivity:</label>
              <select
                value={newOxygen}
                onChange={(e) => setNewOxygen(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Storage Temperature:</label>
              <input
                type="text"
                value={newTemp}
                onChange={(e) => setNewTemp(e.target.value)}
                placeholder="Ambient (15-25°C)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Packaging Option:</label>
              <select
                value={newOptionId}
                onChange={(e) => setNewOptionId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              >
                {options.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Packaging Requirements Description:</label>
            <textarea
              value={newRequirements}
              onChange={(e) => setNewRequirements(e.target.value)}
              placeholder="e.g. Moisture-resistant barrier container with hermetic lid"
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow"
            >
              Save Food Record & Mapping
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: IMPORT DATASET */}
      {activeTab === 'import_dataset' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
              Import Excel or CSV Packaging Dataset
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload an updated version of <code className="text-brand-600 font-semibold">food_packing_ai_dataset.xlsx</code>. The system validates all 5 sheets (Food Varieties, Packaging Materials, AI Mapping, AI Tasks, Read Me) and updates relational tables.
            </p>
          </div>

          {importResult && (
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium">
              {importResult}
            </div>
          )}

          <form onSubmit={handleImport} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-brand-500 transition-colors">
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-950 dark:file:text-brand-300 hover:file:bg-brand-100"
              />
              <p className="text-[11px] text-slate-400 mt-2">Supports .xlsx and .xls formats</p>
            </div>

            <button
              type="submit"
              disabled={importLoading || !importFile}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow flex items-center justify-center gap-2"
            >
              {importLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>Validate & Process Dataset Import</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
