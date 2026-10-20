import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FoodSearchPage } from './pages/FoodSearchPage';
import { PackagingLibraryPage } from './pages/PackagingLibraryPage';
import { RecommendationPage } from './pages/RecommendationPage';
import { ProtectionGuidePage } from './pages/ProtectionGuidePage';
import { ComparisonPage } from './pages/ComparisonPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => !!localStorage.getItem('foodpack_token'));

  // Cross-page parameters
  const [foodSearchTerm, setFoodSearchTerm] = useState<string>('');
  const [foodCategoryId, setFoodCategoryId] = useState<number | undefined>(undefined);
  const [selectedMethodId, setSelectedMethodId] = useState<number | undefined>(undefined);
  const [recommendationFood, setRecommendationFood] = useState<string>('');
  const [comparisonOptionIds, setComparisonOptionIds] = useState<number[]>([1, 2]);
  const [comparisonFoodId, setComparisonFoodId] = useState<number | undefined>(undefined);

  // Navigation handlers
  const handleHomeSearch = (term: string) => {
    setFoodSearchTerm(term);
    setActiveTab('foods');
  };

  const handleHomeCategory = (catId: number) => {
    setFoodCategoryId(catId);
    setFoodSearchTerm('');
    setActiveTab('foods');
  };

  const handleHomeMethod = (methodId: number) => {
    setSelectedMethodId(methodId);
    setActiveTab('library');
  };

  const handleNavigateToRecommendation = (foodName: string) => {
    setRecommendationFood(foodName);
    setActiveTab('recommendation');
  };

  const handleNavigateToComparison = (optionIds: number[], foodId?: number) => {
    setComparisonOptionIds(optionIds);
    setComparisonFoodId(foodId);
    setActiveTab('comparison');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onOpenAdmin={() => setActiveTab('admin')}
      />

      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={setActiveTab}
            onSearchFood={handleHomeSearch}
            onSelectCategory={handleHomeCategory}
            onSelectMethod={handleHomeMethod}
          />
        )}

        {activeTab === 'foods' && (
          <FoodSearchPage
            initialSearchTerm={foodSearchTerm}
            initialCategoryId={foodCategoryId}
            onNavigateToRecommendation={handleNavigateToRecommendation}
            onNavigateToComparison={handleNavigateToComparison}
          />
        )}

        {activeTab === 'library' && (
          <PackagingLibraryPage
            initialMethodId={selectedMethodId}
            onSelectCompare={(optId) => handleNavigateToComparison([optId, 1])}
          />
        )}

        {activeTab === 'recommendation' && (
          <RecommendationPage
            initialFoodName={recommendationFood}
            onNavigateToComparison={handleNavigateToComparison}
          />
        )}

        {activeTab === 'protection' && (
          <ProtectionGuidePage
            onSelectPackagingMethod={(mCode) => {
              setActiveTab('library');
            }}
          />
        )}

        {activeTab === 'comparison' && (
          <ComparisonPage
            initialOptionIds={comparisonOptionIds}
            initialFoodId={comparisonFoodId}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPage
            onLoginSuccess={() => setIsAdmin(true)}
            onLogout={() => setIsAdmin(false)}
          />
        )}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
