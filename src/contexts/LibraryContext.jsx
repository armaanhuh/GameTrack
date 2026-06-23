import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { fetchLibrary, saveLibrary } from '../services/storage';

const LibraryContext = createContext();

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

export const LibraryProvider = ({ children }) => {
  const [library, setLibrary] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [apiKey, setApiKeyState] = useState(() => {
    return localStorage.getItem('gt_api_key') || '';
  });
  
  // Theme state ('dark' or 'light')
  const [theme, setTheme] = useState(localStorage.getItem('gt_theme') || 'dark');
  
  // Platforms owned by user
  const [platformsOwned, setPlatformsOwned] = useState(() => {
    const existing = localStorage.getItem('gt_platforms_owned');
    return existing ? JSON.parse(existing) : [];
  });

  const prevLibraryRef = useRef(null);

  // Load API Key and Library on mount
  useEffect(() => {
    const initLibrary = async () => {
      try {
        setIsLoading(true);
        const data = await fetchLibrary();
        setLibrary(data);
        prevLibraryRef.current = JSON.stringify(data);
        setHasLoaded(true);
      } catch (err) {
        setError('Failed to sync library from backend');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    initLibrary();
  }, []);

  // Sync theme changes to document Element class
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('gt_theme', theme);
  }, [theme]);

  // Debounced auto-save hook
  useEffect(() => {
    if (!hasLoaded) return;

    const currentStr = JSON.stringify(library);
    if (currentStr === prevLibraryRef.current) return;

    const timer = setTimeout(async () => {
      const success = await saveLibrary(library);
      if (success) {
        prevLibraryRef.current = currentStr;
      } else {
        console.error('Failed to sync library changes to server.');
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [library, hasLoaded]);

  // Save API Key
  const setApiKey = (key) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    if (trimmed) {
      localStorage.setItem('gt_api_key', trimmed);
    } else {
      localStorage.removeItem('gt_api_key');
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toggle platform ownership
  const togglePlatformOwned = (platformId) => {
    setPlatformsOwned(prev => {
      const updated = prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId];
      localStorage.setItem('gt_platforms_owned', JSON.stringify(updated));
      return updated;
    });
  };

  // Add a new game
  const addGame = (game) => {
    // Add default dates if missing
    const newGame = {
      ...game,
      dateAdded: game.dateAdded || new Date().toISOString().split('T')[0]
    };
    setLibrary(prev => {
      // Check if already exists
      if (prev.some(g => g.id === newGame.id)) return prev;
      return [newGame, ...prev];
    });
  };

  // Update an existing game
  const updateGame = (updatedGame) => {
    setLibrary(prev => 
      prev.map(game => (game.id === updatedGame.id ? updatedGame : game))
    );
  };

  // Delete a game from library
  const deleteGame = (id) => {
    setLibrary(prev => prev.filter(game => game.id !== id));
  };

  // Import library from external data
  const importLibrary = async (importedData) => {
    if (!Array.isArray(importedData)) {
      throw new Error('Invalid format. Expected a JSON array of games.');
    }
    // Basic structural validation
    for (const item of importedData) {
      if (!item.hasOwnProperty('id') || !item.hasOwnProperty('title')) {
        throw new Error('Invalid format. Each game must have at least an "id" and "title".');
      }
    }
    setLibrary(importedData);
    await saveLibrary(importedData);
    prevLibraryRef.current = JSON.stringify(importedData);
    return true;
  };

  return (
    <LibraryContext.Provider
      value={{
        library,
        isLoading,
        error,
        apiKey,
        setApiKey,
        hasApiKey: !!apiKey,
        theme,
        toggleTheme,
        platformsOwned,
        togglePlatformOwned,
        addGame,
        updateGame,
        deleteGame,
        importLibrary,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};
