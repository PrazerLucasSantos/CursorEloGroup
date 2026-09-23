/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ExploreMissionsView } from './components/ExploreMissionsView';
import { MissionDetailView } from './components/MissionDetailView';
import { QuestionnaireFlow } from './components/QuestionnaireFlow';
import { ResultsView } from './components/ResultsView';
import { CitizenProfileView } from './components/CitizenProfileView';
import { ManagerDashboardView } from './components/ManagerDashboardView';
import { AIIntelligenceView } from './components/AIIntelligenceView';
import { MTLoginModal } from './components/MTLoginModal';
import { MapSelectorModal } from './components/MapSelectorModal';
import { ImageLinksModal } from './components/ImageLinksModal';
import { INITIAL_MISSIONS } from './data/mockData';
import { ViewMode, UserRole, Mission } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [selectedMission, setSelectedMission] = useState<Mission>(INITIAL_MISSIONS[0]);
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Todas as Regiões');

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMapSelectorOpen, setIsMapSelectorOpen] = useState(false);
  const [isImageLinksOpen, setIsImageLinksOpen] = useState(false);

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMission = (mission: Mission) => {
    setSelectedMission(mission);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartParticipation = (mission: Mission) => {
    setSelectedMission(mission);
    setCurrentView('participate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishParticipation = () => {
    setCurrentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleRole = () => {
    const nextRole = userRole === 'citizen' ? 'manager' : 'citizen';
    setUserRole(nextRole);
    if (nextRole === 'manager' && currentView !== 'manager' && currentView !== 'ai-intelligence') {
      setCurrentView('manager');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isHighContrast ? 'high-contrast' : ''} bg-[#f8f9fb]`}>
      {/* App Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenImageLinksModal={() => setIsImageLinksOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q && currentView !== 'explore') {
            setCurrentView('explore');
          }
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <HomeView
            missions={missions}
            onSelectMission={handleSelectMission}
            onNavigate={handleNavigate}
            onOpenMapSelector={() => setIsMapSelectorOpen(true)}
          />
        )}

        {currentView === 'explore' && (
          <ExploreMissionsView
            missions={missions}
            onSelectMission={handleSelectMission}
            onOpenMapSelector={() => setIsMapSelectorOpen(true)}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
          />
        )}

        {currentView === 'detail' && (
          <MissionDetailView
            mission={selectedMission}
            onBack={() => handleNavigate('explore')}
            onStartParticipation={handleStartParticipation}
            onOpenImageLinksModal={() => setIsImageLinksOpen(true)}
          />
        )}

        {currentView === 'participate' && (
          <QuestionnaireFlow
            mission={selectedMission}
            onBack={() => handleNavigate('detail')}
            onFinish={handleFinishParticipation}
          />
        )}

        {currentView === 'results' && (
          <ResultsView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'profile' && (
          <CitizenProfileView
            onNavigate={handleNavigate}
            onSelectMissionById={(id) => {
              const m = missions.find((item) => item.id === id) || missions[0];
              handleSelectMission(m);
            }}
          />
        )}

        {currentView === 'manager' && (
          <ManagerDashboardView
            missions={missions}
            onNavigate={handleNavigate}
            onSelectMission={handleSelectMission}
          />
        )}

        {currentView === 'ai-intelligence' && (
          <AIIntelligenceView onNavigate={handleNavigate} />
        )}
      </main>

      {/* App Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenImageLinksModal={() => setIsImageLinksOpen(true)}
      />

      {/* Modals */}
      <MTLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentRole={userRole}
        onSelectRole={(role) => setUserRole(role)}
      />

      <MapSelectorModal
        isOpen={isMapSelectorOpen}
        onClose={() => setIsMapSelectorOpen(false)}
        selectedRegion={selectedRegion}
        onSelectRegion={(reg) => {
          setSelectedRegion(reg);
          if (currentView !== 'explore') {
            setCurrentView('explore');
          }
        }}
      />

      <ImageLinksModal
        isOpen={isImageLinksOpen}
        onClose={() => setIsImageLinksOpen(false)}
      />
    </div>
  );
}
