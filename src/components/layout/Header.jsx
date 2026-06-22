import React, { useState, useEffect, useRef } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';

export default function Header({ currentHash, onOpenSearch }) {
  const { theme, toggleTheme, library, apiKey, setApiKey, importLibrary } = useLibrary();

  // Settings dropdown state
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  // Refs for click outside
  const settingsRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const fileInputRef = useRef(null);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  // Sync temp API key state when settings opens
  useEffect(() => {
    if (showSettings) {
      setTempApiKey(apiKey);
      setImportError('');
      setImportSuccess(false);
      setApiKeySaved(false);
    }
  }, [showSettings, apiKey]);

  // Click outside settings dropdown listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target)
      ) {
        setShowSettings(false);
      }
    };
    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  // Save API Key handler
  const handleSaveApiKey = () => {
    setApiKey(tempApiKey);
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  // Export database as JSON file
  const handleExport = () => {
    if (library.length === 0) {
      alert("Your library is empty. Nothing to export.");
      return;
    }
    const dataStr = JSON.stringify(library, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gametrack_library.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import database handler
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        await importLibrary(data);
        setImportSuccess(true);
        setImportError('');
        setTimeout(() => setImportSuccess(false), 3000);
      } catch (err) {
        setImportError(err.message || 'Failed to parse JSON file');
        setImportSuccess(false);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const navLinks = [
    { 
      label: 'Dashboard', 
      hash: '#/dashboard',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      label: 'Backlog', 
      hash: '#/library',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    { 
      label: 'Platforms', 
      hash: '#/platforms',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      label: 'Analytics', 
      hash: '#/analytics',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="w-full px-6 md:px-10 h-16 flex items-center justify-between relative">
        
        {/* Logo */}
        <div className="flex-shrink-0 z-10">
          <a href="#/dashboard" className="flex items-center space-x-2 text-2xl font-display font-semibold tracking-tight hover:opacity-85">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959-.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
            </svg>
            <span>Game<span className="text-accent">Track</span></span>
          </a>
        </div>

        {/* Center Navigation (Perfectly centered on screen) */}
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center space-x-8 z-0">
          {navLinks.map((link) => {
            const isActive = currentHash === link.hash || (link.hash === '#/dashboard' && currentHash === '');
            return (
              <a
                key={link.hash}
                href={link.hash}
                className={`flex items-center space-x-1.5 text-xs uppercase tracking-widest py-1 border-b font-medium transition-all duration-200 ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-text hover:border-text-secondary/50'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4 z-10">
          
          {/* Global Search Box Pill */}
          <button
            onClick={onOpenSearch}
            aria-label="Search games (Cmd+K)"
            className="flex items-center space-x-3 px-3 py-1.5 border border-border bg-surface text-text-secondary hover:border-accent hover:text-text rounded-full text-xs font-sans"
          >
            <svg
              className="w-3.5 h-3.5 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Search games...</span>
            <kbd className="hidden sm:inline-block border border-border bg-bg px-1.5 py-0.5 rounded text-[10px] font-mono leading-none">
              ⌘K
            </kbd>
          </button>

          {/* Unified Settings Button & Dropdown Container */}
          <div className="relative">
            <button
              ref={settingsButtonRef}
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Settings & Preferences"
              className={`p-2 border bg-surface hover:border-accent hover:text-accent rounded-md text-text-secondary transition-colors group ${
                showSettings ? 'border-accent text-accent' : 'border-border'
              }`}
            >
              {/* Gear Icon */}
              <svg className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869L9.594 3.94zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Dropdown Panel */}
            {showSettings && (
              <div
                ref={settingsRef}
                className="absolute right-0 mt-3 w-80 bg-surface/95 backdrop-blur-md border border-border p-5 shadow-2xl z-50 text-left font-sans rounded-sm animate-dropdown-in"
              >
                {/* Header */}
                <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-text">Preferences</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-text-secondary hover:text-text transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Theme Option */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">Appearance</label>
                    <div className="flex items-center justify-between bg-bg/50 border border-border p-2 rounded-sm">
                      <span className="text-xs text-text">Theme Mode</span>
                      <button
                        onClick={toggleTheme}
                        className="flex items-center space-x-1.5 px-3 py-1 border border-border bg-surface hover:border-accent hover:text-text rounded-sm text-xs transition-colors"
                      >
                        {theme === 'dark' ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>Dark Mode</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            <span>Light Mode</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* RAWG API Key Option */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">RAWG API Key</label>
                      {apiKeySaved && (
                        <span className="text-[10px] text-green-500 font-medium font-sans flex items-center gap-0.5 animate-in fade-in duration-200">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Saved
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        placeholder="Enter API Key"
                        className="flex-1 bg-bg border border-border text-xs px-2.5 py-1.5 text-text focus:outline-none focus:border-accent font-mono rounded-sm"
                      />
                      <button
                        onClick={handleSaveApiKey}
                        className="border border-border bg-surface hover:border-accent hover:text-accent px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Data Management Section */}
                  <div className="space-y-2 border-t border-border/60 pt-4">
                    <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">Data Management</label>
                    
                    {importError && (
                      <p className="text-[10px] text-red-500 leading-tight border border-red-500/20 bg-red-500/5 p-2 rounded-sm mb-2">
                        {importError}
                      </p>
                    )}
                    {importSuccess && (
                      <p className="text-[10px] text-green-500 leading-tight border border-green-500/20 bg-green-500/5 p-2 rounded-sm flex items-center gap-1 mb-2 animate-in fade-in duration-200">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Library imported successfully!
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {/* Export */}
                      <button
                        onClick={handleExport}
                        className="flex items-center justify-center space-x-1.5 border border-border bg-bg hover:border-accent hover:text-accent py-2 text-[9px] uppercase tracking-widest font-semibold transition-colors rounded-sm cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Export</span>
                      </button>

                      {/* Import */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center space-x-1.5 border border-border bg-bg hover:border-accent hover:text-accent py-2 text-[9px] uppercase tracking-widest font-semibold transition-colors rounded-sm cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Import</span>
                      </button>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportFile}
                        accept=".json"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
