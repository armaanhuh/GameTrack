import React, { useState, useEffect, useRef } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import { searchGames, getGameDetails } from '../../services/rawg';

export default function SearchModal({ onClose, onSelectGame }) {
  const { library } = useLibrary();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  const abortRef = useRef(null);

  // Close modal when clicking outside, Escape key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);

    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Debounced search logic with abort control
  useEffect(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const controller = new AbortController();
    abortRef.current = controller;

    const delayDebounceFn = setTimeout(async () => {
      try {
        const games = await searchGames(query, controller.signal);
        if (!controller.signal.aborted) {
          setResults(games);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(err);
        setError(err.message || 'Error searching games.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [query]);

  // Handle clicking on a game result
  const handleGameClick = async (game) => {
    const existingGame = library.find(g => g.id === game.id);
    if (existingGame) {
      onSelectGame(existingGame);
      onClose();
      return;
    }

    setLoading(true);
    try {
      const details = await getGameDetails(game.id);
      
      // Map RAWG API properties to our schema
      const mappedGame = {
        id: details.id,
        title: details.name,
        year: details.released ? new Date(details.released).getFullYear() : null,
        metacritic: details.metacritic || null,
        genres: details.genres ? details.genres.map(g => g.name) : [],
        synopsis: details.description_raw || details.description || '',
        platformsOwned: [], // user will select this
        status: 'backlog', // default
        playtimeHours: 0,
        yourRating: 0,
        replayCount: 0,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      
      onSelectGame(mappedGame);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve game details from RAWG.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 animate-backdrop-in">
      <div
        ref={modalRef}
        className="w-full max-w-2xl border border-border bg-surface flex flex-col max-h-[75vh] animate-scale-in"
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-border px-4 py-3">
          <svg
            className="w-5 h-5 text-text-secondary mr-3"
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
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games registry by title..."
            className="w-full bg-transparent text-text text-base border-none focus:outline-none placeholder-text-secondary"
          />
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text text-xs uppercase tracking-widest border border-border px-2.5 py-1 hover:border-accent hover:text-accent transition-colors ml-2 btn-micro-bounce"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {loading && (
            <div className="py-12 text-center text-text-secondary text-sm">
              <span className="inline-block animate-pulse">Syncing gaming registry...</span>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-400 text-sm font-sans">
              {error}
            </div>
          )}

          {!loading && !error && query && results.length === 0 && (
            <div className="py-12 text-center text-text-secondary text-sm font-sans">
              No matching games found in RAWG registry.
            </div>
          )}

          {!loading && !error && !query && (
            <div className="py-12 text-center text-text-secondary text-xs uppercase tracking-widest">
              Type to search games catalog
            </div>
          )}

          {!loading && !error && results.map((game) => {
            const inLibrary = library.some(g => g.id === game.id);
            const releaseYear = game.released ? new Date(game.released).getFullYear() : 'N/A';
            const platforms = game.platforms ? game.platforms.map(p => p.platform.name).join(', ') : '';

            return (
              <button
                key={game.id}
                onClick={() => handleGameClick(game)}
                className="w-full text-left px-6 py-4 flex items-center justify-between group list-item-slide"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-sm font-semibold text-text group-hover:text-accent truncate transition-colors">
                      {game.name}
                    </h3>
                    <span className="text-xs text-text-secondary">({releaseYear})</span>
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-1">
                    {platforms}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {game.metacritic && (
                    <span className="text-xs border border-border px-1.5 py-0.5 rounded font-mono font-bold text-text bg-surface">
                      MC: {game.metacritic}
                    </span>
                  )}
                  {inLibrary ? (
                    <span className="text-[10px] uppercase tracking-widest text-accent border border-accent bg-accent/5 px-2 py-0.5 font-bold">
                      In Library
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest text-text-secondary border border-border px-2 py-0.5 group-hover:border-accent group-hover:text-accent transition-colors">
                      + Add
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
