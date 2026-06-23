import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import { formatPlaytime } from '../../services/stats';

const STATUS_LABELS = {
  backlog: { label: 'Backlog', color: 'border-status-backlog text-status-backlog bg-status-backlog/5' },
  playing: { label: 'Playing', color: 'border-status-playing text-status-playing bg-status-playing/5' },
  completed: { label: 'Completed', color: 'border-status-completed text-status-completed bg-status-completed/5' },
  multiplayer: { label: 'Multiplayer', color: 'border-status-multiplayer text-status-multiplayer bg-status-multiplayer/5' },
  endless: { label: 'Endless', color: 'border-status-endless text-status-endless bg-status-endless/5' },
  onhold: { label: 'On Hold', color: 'border-status-onhold text-status-onhold bg-status-onhold/5' },
  dropped: { label: 'Dropped', color: 'border-status-dropped text-status-dropped bg-status-dropped/5' }
};

const PLATFORM_LABELS = {
  steam: 'Steam',
  epic: 'Epic',
  xbox: 'Xbox',
  ea: 'EA'
};

export default function BacklogPage({ onSelectGame }) {
  const { library } = useLibrary();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dateAddedDesc');

  // Memoized filter and sort implementation to optimize render performance
  const sortedGames = useMemo(() => {
    const filtered = library.filter(game => {
      // 1. Text Search
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Status Filter
      const matchesStatus = statusFilter === 'all' || game.status === statusFilter;
      
      // 3. Platform Filter
      const matchesPlatform = platformFilter === 'all' || 
        (game.platformsOwned && game.platformsOwned.includes(platformFilter));

      return matchesSearch && matchesStatus && matchesPlatform;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'metacritic':
          return (b.metacritic || 0) - (a.metacritic || 0);
        case 'playtime':
          return (b.playtimeHours || 0) - (a.playtimeHours || 0);
        case 'rating':
          return (b.yourRating || 0) - (a.yourRating || 0);
        case 'dateAddedDesc':
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        case 'dateAddedAsc':
          return new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0);
        default:
          return 0;
      }
    });
  }, [library, searchQuery, statusFilter, platformFilter, sortBy]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-text mb-2">Backlog Registry</h1>
          <p className="text-text-secondary text-sm">Review, filter, and sort your gaming library collection.</p>
        </div>
        <div className="text-xs text-text-secondary font-mono">
          Showing {sortedGames.length} of {library.length} games
        </div>
      </div>

      {/* Registry Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border border-border bg-surface p-4">
        {/* Title Search */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-text-secondary">Search Title</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type name..."
            className="w-full border border-border bg-bg text-text text-xs py-2 px-3 focus:outline-none focus:border-accent"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-text-secondary">Filter Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-border bg-bg text-text text-xs py-2 px-3 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="playing">Playing</option>
            <option value="completed">Completed</option>
            <option value="onhold">On Hold</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>

        {/* Platform Filter */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-text-secondary">Filter Platform</label>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="w-full border border-border bg-bg text-text text-xs py-2 px-3 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Platforms</option>
            {Object.keys(PLATFORM_LABELS).map((key) => (
              <option key={key} value={key}>
                {PLATFORM_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-text-secondary">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border border-border bg-bg text-text text-xs py-2 px-3 focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="dateAddedDesc">Date Added (Newest)</option>
            <option value="dateAddedAsc">Date Added (Oldest)</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
            <option value="metacritic">Metacritic Score</option>
            <option value="playtime">Playtime Hours</option>
            <option value="rating">Your Rating</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet List */}
      <div className="border border-border bg-surface overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-bg/50">
              <th className="py-3 px-6 text-[10px] uppercase tracking-widest text-text-secondary font-semibold w-2/5">Title & Year</th>
              <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-text-secondary font-semibold text-center w-1/12">Metacritic</th>
              <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-text-secondary font-semibold w-1/5">Platforms Owned</th>
              <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-text-secondary font-semibold text-center w-1/10">Status</th>
              <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-text-secondary font-semibold text-center w-1/12">Playtime</th>
              <th className="py-3 px-6 text-[10px] uppercase tracking-widest text-text-secondary font-semibold text-center w-1/12">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedGames.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-secondary font-sans">
                  No games found matching the criteria.
                </td>
              </tr>
            ) : (
              sortedGames.map((game) => {
                const statusDetails = STATUS_LABELS[game.status] || { label: game.status, color: 'border-border text-text-secondary' };
                return (
                  <tr
                    key={game.id}
                    onClick={() => onSelectGame(game)}
                    className="cursor-pointer group table-row-hover"
                  >
                    {/* Title & Year */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-text group-hover:text-accent transition-colors truncate max-w-md">
                        {game.title}
                      </div>
                      {game.year && (
                        <div className="text-xs text-text-secondary mt-0.5 font-mono">
                          Released {game.year}
                        </div>
                      )}
                    </td>

                    {/* Metacritic Score */}
                    <td className="py-4 px-4 text-center">
                      {game.metacritic ? (
                        <span className="inline-block border border-border px-1.5 py-0.5 rounded font-mono font-bold text-xs text-text bg-bg">
                          {game.metacritic}
                        </span>
                      ) : (
                        <span className="text-text-secondary text-xs font-mono">—</span>
                      )}
                    </td>

                    {/* Platforms Owned Pills */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {game.platformsOwned && game.platformsOwned.length > 0 ? (
                          game.platformsOwned.map((plat) => (
                            <span
                              key={plat}
                              className="text-[9px] uppercase tracking-wider border border-border px-1.5 py-0.5 bg-bg/50 text-text-secondary font-medium font-sans"
                            >
                              {PLATFORM_LABELS[plat] || plat}
                            </span>
                          ))
                        ) : (
                          <span className="text-text-secondary text-xs font-mono">—</span>
                        )}
                      </div>
                    </td>

                    {/* Current Status tag */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block border text-[10px] uppercase tracking-wider px-2.5 py-0.5 font-semibold ${statusDetails.color}`}>
                        {statusDetails.label}
                      </span>
                    </td>

                    {/* Playtime */}
                    <td className="py-4 px-4 text-center font-mono text-xs text-text">
                      {formatPlaytime(game.playtimeHours)}
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-6 text-center">
                      {game.yourRating ? (
                        <span className="font-mono text-xs font-semibold text-accent">
                          {game.yourRating}/10
                        </span>
                      ) : (
                        <span className="text-text-secondary text-xs font-mono">Unrated</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
