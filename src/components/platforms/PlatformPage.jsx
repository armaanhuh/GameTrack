import React, { useMemo, useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import { groupByPlatform, formatPlaytime } from '../../services/stats';

const STATUS_BULLETS = {
  backlog: 'bg-status-backlog',
  playing: 'bg-status-playing',
  completed: 'bg-status-completed',
  multiplayer: 'bg-status-multiplayer',
  endless: 'bg-status-endless',
  onhold: 'bg-status-onhold',
  dropped: 'bg-status-dropped'
};

const AVAILABLE_PLATFORMS = [
  { id: 'steam', label: 'Steam' },
  { id: 'epic', label: 'Epic' },
  { id: 'xbox', label: 'Xbox' },
  { id: 'ea', label: 'EA' }
];

export default function PlatformPage({ onSelectGame }) {
  const { library, platformsOwned, togglePlatformOwned, updateGame } = useLibrary();
  const [editingGameId, setEditingGameId] = useState(null);
  
  // Memoize platform grouping calculations to avoid re-runs on every hover/re-render
  const platformGroups = useMemo(() => groupByPlatform(library), [library]);

  const platforms = [
    { 
      key: 'Steam', 
      title: 'Steam', 
      subtitle: 'Steam Store & Library',
      platformIds: ['steam'],
      colorClass: 'border-l-4 border-l-blue-500',
      icon: (
        <svg className="w-6 h-6 text-text-secondary shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
        </svg>
      )
    },
    { 
      key: 'Epic', 
      title: 'Epic Games', 
      subtitle: 'Epic Games Store',
      platformIds: ['epic'],
      colorClass: 'border-l-4 border-l-orange-500',
      icon: (
        <svg className="w-6 h-6 text-text-secondary shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
        </svg>
      )
    },
    { 
      key: 'Xbox', 
      title: 'Xbox', 
      subtitle: 'Xbox App & Game Pass',
      platformIds: ['xbox'],
      colorClass: 'border-l-4 border-l-green-500',
      icon: (
        <svg className="w-6 h-6 text-text-secondary shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811z" />
        </svg>
      )
    },
    { 
      key: 'EA', 
      title: 'EA App', 
      subtitle: 'EA App & Origin',
      platformIds: ['ea'],
      colorClass: 'border-l-4 border-l-red-500',
      icon: (
        <svg className="w-6 h-6 text-text-secondary shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-4xl font-display font-bold text-text mb-2">Platform Registry</h1>
        <p className="text-text-secondary text-sm">Analyze completion rates and time investments across platform classes.</p>
      </div>

      {/* Platforms Owned Selector */}
      <div className="border border-border bg-surface/50 p-6">
        <h2 className="text-sm uppercase tracking-widest font-semibold text-text-secondary mb-4">Platforms Owned</h2>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_PLATFORMS.map((plat) => {
            const isOwned = platformsOwned.includes(plat.id);
            return (
              <button
                key={plat.id}
                onClick={() => togglePlatformOwned(plat.id)}
                className={`px-4 py-2 border text-sm font-medium btn-micro-bounce ${
                  isOwned
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-bg text-text-secondary hover:border-text-secondary hover:text-text'
                }`}
              >
                {plat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {platforms.map((plat) => {
          // Filter by owned platforms - show if ANY of the platform IDs are owned
          const hasOwnedPlatform = plat.platformIds.some(id => platformsOwned.includes(id));
          if (!hasOwnedPlatform) return null;
          
          const groupData = platformGroups[plat.key] || { games: [], hours: 0, completed: 0, completionRate: 0 };
          const { games, hours, completed, completionRate } = groupData;
          
          return (
            <div
              key={plat.key}
              className="border border-border bg-surface p-6 flex flex-col justify-between space-y-6 card-hover-lift"
            >
              {/* Header Title */}
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {plat.icon}
                    <div>
                      <h2 className="text-2xl font-display font-semibold text-text">{plat.title}</h2>
                      <p className="text-xs text-text-secondary mt-0.5">{plat.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-text-secondary">Playtime</p>
                    <p className="text-lg font-mono font-bold text-accent">{formatPlaytime(hours)}</p>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-secondary">Completion Rate</span>
                    <span className="font-semibold text-text">{completionRate}%</span>
                  </div>
                  {/* Thin horizontal progress bar */}
                  <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-text-secondary text-right">
                    {completed} of {games.length} games completed
                  </div>
                </div>
              </div>

              {/* Games belonging to platform */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-text-secondary border-b border-border pb-1 font-semibold">
                  Registered Titles ({games.length})
                </p>
                
                {games.length === 0 ? (
                  <p className="text-xs text-text-secondary py-4 text-center font-sans">
                    No games owned on this platform yet.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                    {games.map((game) => {
                      const isEditing = editingGameId === game.id;
                      const gameRecord = library.find(g => g.id === game.id);
                      const gamePlatforms = gameRecord?.platformsOwned || [];
                      
                      return (
                        <div
                          key={game.id}
                          className="py-2 px-3 border border-border bg-bg/30 hover:border-accent transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div 
                              className="flex items-center space-x-2 truncate flex-1 cursor-pointer hover:text-accent"
                              onClick={() => {
                                if (!isEditing) onSelectGame(game);
                              }}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_BULLETS[game.status] || 'bg-status-backlog'}`} />
                              <span className="text-xs text-text group-hover:text-accent font-semibold transition-colors truncate">
                                {game.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-text-secondary flex-shrink-0">
                              {formatPlaytime(game.playtimeHours)}
                            </span>
                          </div>
                          
                          {/* Platform tags - editable */}
                          <div className="flex flex-wrap gap-1">
                            {isEditing ? (
                              <>
                                {AVAILABLE_PLATFORMS.map((plat) => {
                                  const isOwned = gamePlatforms.includes(plat.id);
                                  return (
                                    <button
                                      key={plat.id}
                                      onClick={() => {
                                        const updated = {
                                          ...gameRecord,
                                          platformsOwned: isOwned
                                            ? gamePlatforms.filter(p => p !== plat.id)
                                            : [...gamePlatforms, plat.id]
                                        };
                                        updateGame(updated);
                                      }}
                                      className={`text-[9px] px-2 py-0.5 border btn-micro-bounce ${
                                        isOwned
                                          ? 'border-accent bg-accent/10 text-accent font-semibold'
                                          : 'border-border bg-bg text-text-secondary hover:border-text-secondary hover:text-text'
                                      }`}
                                    >
                                      {plat.label}
                                    </button>
                                  );
                                })}
                                <button
                                  onClick={() => setEditingGameId(null)}
                                  className="text-[9px] px-2 py-0.5 border border-border bg-bg text-text-secondary hover:border-accent hover:text-accent transition-all btn-micro-bounce"
                                >
                                  Done
                                </button>
                              </>
                            ) : (
                              <>
                                {gamePlatforms.length > 0 ? (
                                  gamePlatforms.map((platId) => {
                                    const platform = AVAILABLE_PLATFORMS.find(p => p.id === platId);
                                    return (
                                      <span
                                        key={platId}
                                        className="text-[9px] px-2 py-0.5 border border-accent/50 bg-accent/5 text-accent font-medium"
                                      >
                                        {platform?.label || platId}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-[9px] text-text-secondary italic">
                                    No platforms
                                  </span>
                                )}
                                <button
                                  onClick={() => setEditingGameId(game.id)}
                                  className="text-[9px] px-2 py-0.5 border border-border bg-bg text-text-secondary hover:border-text-secondary hover:text-text transition-all btn-micro-bounce"
                                  title="Edit platforms"
                                >
                                  Edit
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
