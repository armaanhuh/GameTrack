import React, { useState, useEffect, useRef } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';

const AVAILABLE_PLATFORMS = [
  { id: 'steam', label: 'Steam' },
  { id: 'epic', label: 'Epic' },
  { id: 'xbox', label: 'Xbox' },
  { id: 'ea', label: 'EA' }
];

export default function GameDetailModal({ game, onClose }) {
  const { addGame, updateGame, deleteGame, library } = useLibrary();
  const modalRef = useRef(null);

  const isExisting = library.some(g => g.id === game.id);

  const [status, setStatus] = useState(game.status || 'backlog');
  const [platformsOwned, setPlatformsOwned] = useState(game.platformsOwned || []);
  const [hours, setHours] = useState(Math.floor(game.playtimeHours || 0));
  const [minutes, setMinutes] = useState(Math.round(((game.playtimeHours || 0) % 1) * 60));
  const [yourRating, setYourRating] = useState(game.yourRating || 0);
  const [replayCount, setReplayCount] = useState(game.replayCount || game.rewatchCount || 0);

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setStatus(game.status || 'backlog');
    setPlatformsOwned(game.platformsOwned || []);
    setHours(Math.floor(game.playtimeHours || 0));
    setMinutes(Math.round(((game.playtimeHours || 0) % 1) * 60));
    setYourRating(game.yourRating || 0);
    setReplayCount(game.replayCount || game.rewatchCount || 0);
    setConfirmDelete(false);
  }, [game]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [onClose]);

  // Platform pill toggle
  const togglePlatform = (platId) => {
    setPlatformsOwned(prev =>
      prev.includes(platId)
        ? prev.filter(p => p !== platId)
        : [...prev, platId]
    );
  };

  const handleSave = () => {
    const calculatedHours = Number(hours) + (Number(minutes) / 60);
    const playtimeHours = Math.round(calculatedHours * 100) / 100;

    const updatedRecord = {
      ...game,
      status,
      platformsOwned,
      playtimeHours,
      yourRating: Number(yourRating),
      replayCount: Number(replayCount),
    };

    if (isExisting) {
      updateGame(updatedRecord);
    } else {
      addGame(updatedRecord);
    }
    onClose();
  };

  const handleDelete = () => {
    deleteGame(game.id);
    onClose();
  };

  // Strip HTML tags from RAWG synopsis if needed
  const cleanSynopsis = (htmlText) => {
    if (!htmlText) return '';
    return htmlText.replace(/<\/?[^>]+(>|$)/g, "");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 pb-10 px-4 overflow-y-auto animate-backdrop-in">
      <div ref={modalRef} className="w-full max-w-2xl border border-border bg-surface p-8 relative flex flex-col my-auto animate-scale-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text hover:border-accent border border-border px-3 py-1 text-xs uppercase tracking-widest transition-colors"
        >
          Close
        </button>

        {/* Horizontal Align Centered Metadata Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-display font-bold text-accent mb-2">
            {game.title}
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-text-secondary">
            {game.year && <span>{game.year}</span>}
            {game.year && game.metacritic && <span className="text-border">|</span>}
            {game.metacritic && (
              <span className="border border-border px-1.5 py-0.5 rounded font-mono font-bold text-text bg-bg">
                Metacritic: {game.metacritic}
              </span>
            )}
            {game.genres && game.genres.length > 0 && (
              <>
                <span className="text-border">|</span>
                <span>{game.genres.join(', ')}</span>
              </>
            )}
          </div>
        </div>

        {/* Synopsis Scroll Area */}
        {game.synopsis && (
          <div className="border border-border bg-bg/40 p-4 mb-6 max-h-[400px] overflow-y-auto text-xs text-text-secondary leading-relaxed text-center">
            {cleanSynopsis(game.synopsis)}
          </div>
        )}

        {/* Forms Center Block */}
        <div className="space-y-6">
          
          {/* Status Dropdown Selection */}
          <div className="text-center">
            <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
              Status
            </label>
            <div className="inline-block relative w-48">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-border bg-bg text-text text-sm py-2 px-3 focus:outline-none focus:border-accent text-center appearance-none cursor-pointer"
                style={{ textAlignLast: 'center' }}
              >
                <option value="backlog">Backlog</option>
                <option value="playing">Currently Playing</option>
                <option value="completed">Completed</option>
                <option value="multiplayer">Multiplayer</option>
                <option value="endless">Endless</option>
                <option value="onhold">On Hold</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </div>

          {/* Platforms Owned Pills Selection */}
          <div className="text-center">
            <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
              Platforms Owned
            </label>
            <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
              {AVAILABLE_PLATFORMS.map((plat) => {
                const isOwned = platformsOwned.includes(plat.id);
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => togglePlatform(plat.id)}
                    className={`text-xs px-3 py-1 border transition-none ${
                      isOwned
                        ? 'border-accent bg-accent/10 text-accent font-semibold'
                        : 'border-border bg-bg text-text-secondary hover:border-text-secondary hover:text-text'
                    }`}
                  >
                    {plat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Numeric Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto">
            {/* Playtime Hours & Minutes Inputs */}
            <div className="text-center">
              <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">
                Playtime
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="Hrs"
                    value={hours}
                    onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full border border-border bg-bg text-text text-sm py-1.5 px-3 focus:outline-none focus:border-accent text-center placeholder:text-text-secondary/50"
                  />
                  <span className="text-[9px] text-text-secondary uppercase tracking-widest mt-1 block">Hrs</span>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Mins"
                    value={minutes}
                    onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-full border border-border bg-bg text-text text-sm py-1.5 px-3 focus:outline-none focus:border-accent text-center placeholder:text-text-secondary/50"
                  />
                  <span className="text-[9px] text-text-secondary uppercase tracking-widest mt-1 block">Mins</span>
                </div>
              </div>
            </div>

            {/* Replay Count Input */}
            <div className="text-center">
              <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">
                Replay Count
              </label>
              <input
                type="number"
                min="0"
                value={replayCount}
                onChange={(e) => setReplayCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full border border-border bg-bg text-text text-sm py-1.5 px-3 focus:outline-none focus:border-accent text-center"
              />
            </div>

            {/* Rating Dropdown Selection */}
            <div className="text-center">
              <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">
                Rating
              </label>
              <select
                value={yourRating}
                onChange={(e) => setYourRating(Number(e.target.value))}
                className="w-full border border-border bg-bg text-text text-sm py-1.5 px-3 focus:outline-none focus:border-accent text-center appearance-none cursor-pointer"
                style={{ textAlignLast: 'center' }}
              >
                <option value={0}>Unrated</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}/10
                  </option>
                ))}
              </select>
            </div>
          </div>




        </div>

        {/* Delete flow & Footer actions */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col items-center space-y-4">
          
          {confirmDelete ? (
            // Centered deletion confirmation message
            <div className="text-center border border-red-500/30 bg-red-500/5 p-4 w-full max-w-md">
              <p className="text-sm text-red-500 font-medium mb-3">
                Remove "{game.title}" from your collection?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDelete}
                  className="px-4 py-1.5 border border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs uppercase tracking-wider transition-colors"
                >
                  Yes, Delete Game
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-1.5 border border-border hover:border-text text-text-secondary hover:text-text text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 w-full">
              {/* Save Button */}
              <button
                onClick={handleSave}
                className="px-8 py-2 border border-accent bg-accent/10 text-accent hover:bg-accent hover:text-white text-xs uppercase tracking-widest font-semibold transition-all duration-200"
              >
                {isExisting ? 'Update Record' : 'Add to Backlog'}
              </button>

              {/* Cancel Button */}
              <button
                onClick={onClose}
                className="px-8 py-2 border border-border text-text-secondary hover:border-text hover:text-text text-xs uppercase tracking-widest transition-all duration-200"
              >
                Cancel
              </button>

              {/* Delete Button (only if existing in library) */}
              {isExisting && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2 border border-red-500/30 text-red-400/80 hover:border-red-500 hover:text-red-500 text-xs uppercase tracking-widest transition-all duration-200 ml-auto sm:ml-0"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
