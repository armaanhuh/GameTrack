import React, { useState, useEffect } from 'react';
import { LibraryProvider, useLibrary } from './contexts/LibraryContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import Header from './components/layout/Header';
import ApiKeySetup from './components/layout/ApiKeySetup';
import SearchModal from './components/layout/SearchModal';
import GameDetailModal from './components/shared/GameDetailModal';
import DashboardPage from './components/dashboard/DashboardPage';
import BacklogPage from './components/backlog/BacklogPage';
import PlatformPage from './components/platforms/PlatformPage';
import AnalyticsPage from './components/analytics/AnalyticsPage';

function GameTrackApp() {
  const { hasApiKey, isLoading, error } = useLibrary();
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/dashboard');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#/') {
        window.location.replace('#/dashboard');
        setCurrentHash('#/dashboard');
      } else {
        setCurrentHash(hash);
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!hasApiKey) {
    return <ApiKeySetup />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] uppercase tracking-widest text-text-secondary">Syncing gaming database...</p>
        </div>
      </div>
    );
  }

  // Render appropriate view based on hash
  const renderPage = () => {
    switch (currentHash) {
      case '#/dashboard':
        return <DashboardPage onSelectGame={setSelectedGame} />;
      case '#/library':
        return <BacklogPage onSelectGame={setSelectedGame} />;
      case '#/platforms':
        return <PlatformPage onSelectGame={setSelectedGame} />;
      case '#/analytics':
        return <AnalyticsPage />;
      default:
        return <DashboardPage onSelectGame={setSelectedGame} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans">
      {/* Floating Header */}
      <Header currentHash={currentHash} onOpenSearch={() => setSearchOpen(true)} />
      
      {/* Main Container */}
      <main className="flex-1 w-full px-6 md:px-10 py-10">
        {error && (
          <div className="mb-6 p-4 border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-sans text-center">
            {error}
          </div>
        )}
        <div key={currentHash} className="animate-page-in">
          {renderPage()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 md:px-10 text-center text-[10px] text-text-secondary font-sans uppercase tracking-widest">
        <p>
          GameTrack &copy; {new Date().getFullYear()} — Premium Backlog Registry. Powered by RAWG API.
        </p>
      </footer>

      {/* Global Search Palette Overlay */}
      {searchOpen && (
        <SearchModal
          onClose={() => setSearchOpen(false)}
          onSelectGame={(game) => setSelectedGame(game)}
        />
      )}

      {/* Game Details Inspector Overlay */}
      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <ErrorBoundary>
        <GameTrackApp />
      </ErrorBoundary>
    </LibraryProvider>
  );
}
