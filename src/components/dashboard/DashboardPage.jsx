import React, { useState, useEffect, useMemo } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import { getRecentActivity, calculatePlayingStreak, formatPlaytime } from '../../services/stats';

export default function DashboardPage({ onSelectGame }) {
  const { library } = useLibrary();
  
  // Dashboard calculation states
  const [suggestions, setSuggestions] = useState([]);

  // Memoize statistics to prevent recalculations on every render
  const { 
    totalGames, 
    playingGames, 
    completedGames, 
    totalPlaytime, 
    completionRate, 
    streak, 
    recentActivities 
  } = useMemo(() => {
    const total = library.length;
    const playing = library.filter(g => g.status === 'playing').length;
    const completed = library.filter(g => g.status === 'completed').length;
    const playtime = Math.round(library.reduce((sum, g) => sum + Number(g.playtimeHours || 0), 0) * 10) / 10;
    
    const completionTotal = library.filter(g => g.status !== 'multiplayer' && g.status !== 'endless').length;
    const rate = completionTotal > 0 ? Math.round((completed / completionTotal) * 100) : 0;
    const streakDays = calculatePlayingStreak(library);
    const activities = getRecentActivity(library);

    return {
      totalGames: total,
      playingGames: playing,
      completedGames: completed,
      totalPlaytime: playtime,
      completionRate: rate,
      streak: streakDays,
      recentActivities: activities
    };
  }, [library]);

  // Track stable backlog game IDs to avoid suggestions shuffling when editing non-backlog fields (e.g. notes)
  const backlogGameIds = useMemo(() => {
    return library
      .filter(g => g.status === 'backlog')
      .map(g => g.id)
      .join(',');
  }, [library]);

  // Generate "What to Play Tonight" suggestions
  useEffect(() => {
    const backlogGames = library.filter(g => g.status === 'backlog');
    if (backlogGames.length === 0) {
      setSuggestions([]);
      return;
    }
    // Pick up to 3 random games
    const shuffled = [...backlogGames].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 3));
  }, [backlogGameIds]);

  const handleTimelineClick = (gameId) => {
    const game = library.find(g => g.id === gameId);
    if (game) onSelectGame(game);
  };

  return (
    <div className="space-y-12">
      {/* Page Title */}
      <div className="border-b border-border pb-6">
        <h1 className="text-4xl font-display font-bold text-text mb-2">Editorial Desk</h1>
        <p className="text-text-secondary text-sm">A summary of your gaming catalog, active pursuits, and history.</p>
      </div>

      {/* Symmetrical Editorial Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-border border border-border">
        
        {/* Total Games */}
        <div className="bg-surface p-6 text-center flex flex-col justify-between items-center stat-card-hover">
          <svg className="w-5 h-5 text-text-secondary mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">Total Catalog</p>
          <p className="text-4xl font-display font-medium text-text">{totalGames}</p>
          <p className="text-[10px] text-text-secondary mt-1">games registered</p>
        </div>

        {/* Currently Playing */}
        <div className="bg-surface p-6 text-center flex flex-col justify-between items-center stat-card-hover">
          <svg className="w-5 h-5 text-accent mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
          <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">Active Play</p>
          <p className="text-4xl font-display font-medium text-accent">{playingGames}</p>
          <p className="text-[10px] text-text-secondary mt-1">currently playing</p>
        </div>

        {/* Completed Backlog */}
        <div className="bg-surface p-6 text-center flex flex-col justify-between items-center stat-card-hover">
          <svg className="w-5 h-5 text-status-completed mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">Archived/Finished</p>
          <p className="text-4xl font-display font-medium text-text">{completedGames}</p>
          <p className="text-[10px] text-text-secondary mt-1">games completed</p>
        </div>

        {/* Total Playtime */}
        <div className="bg-surface p-6 text-center flex flex-col justify-between items-center stat-card-hover">
          <svg className="w-5 h-5 text-text-secondary mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">Time Invested</p>
          <p className="text-4xl font-display font-medium text-text">{formatPlaytime(totalPlaytime)}</p>
          <p className="text-[10px] text-text-secondary mt-1">total playtime</p>
        </div>

        {/* Streak & Completion Rate */}
        <div className="bg-surface p-6 text-center col-span-2 lg:col-span-1 flex flex-col justify-between items-center stat-card-hover">
          <svg className="w-5 h-5 text-status-onhold mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
          </svg>
          <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">Streak / Rate</p>
          <p className="text-4xl font-display font-medium text-text">
            {streak}d <span className="text-sm font-sans text-text-secondary">/ {completionRate}%</span>
          </p>
          <p className="text-[10px] text-text-secondary mt-1">active days & completion</p>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-display font-semibold border-b border-border pb-2">
            Recent Activity Registry
          </h2>
          
          {recentActivities.length === 0 ? (
            <div className="py-12 border border-border border-dashed text-center text-text-secondary text-sm">
              No recent logged registry items. Try searching for a game to add.
            </div>
          ) : (
            <div className="border border-border bg-surface divide-y divide-border">
              {recentActivities.map((act) => {
                const year = act.date ? act.date.getFullYear() : '';
                const dateStr = act.date ? act.date.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                }) : '';
                
                return (
                  <div
                    key={act.id}
                    onClick={() => handleTimelineClick(act.gameId)}
                    className="flex items-center justify-between p-4 cursor-pointer group transition-colors activity-row-hover"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Left icon marker */}
                      <span className={`w-2 h-2 rounded-full activity-dot ${
                        act.type === 'completed'
                          ? 'bg-status-completed'
                          : act.type === 'started'
                          ? 'bg-status-playing'
                          : act.type === 'rated'
                          ? 'bg-status-onhold'
                          : 'bg-status-backlog'
                      }`} />
                      <p className="text-sm text-text font-sans group-hover:text-accent transition-colors">
                        {act.description}
                      </p>
                    </div>
                    <span className="text-xs text-text-secondary font-mono">
                      {dateStr} {year && `'${String(year).slice(-2)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Backlog Suggestions */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-semibold border-b border-border pb-2">
            What to Play Tonight?
          </h2>

          {suggestions.length === 0 ? (
            <div className="py-12 border border-border border-dashed text-center text-text-secondary text-sm">
              Your backlog is clear! Search and add some games to get recommendations.
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((game) => (
                <div
                  key={game.id}
                  className="border border-border bg-surface p-5 group transition-all duration-200 card-hover-lift"
                >
                  <h3 className="font-display text-lg text-text group-hover:text-accent font-semibold transition-colors mb-1">
                    {game.title}
                  </h3>
                  
                  <div className="flex items-center space-x-3 text-xs text-text-secondary mb-3">
                    {game.year && <span>{game.year}</span>}
                    {game.metacritic && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-text font-mono">Metacritic: {game.metacritic}</span>
                      </>
                    )}
                  </div>
                  
                  {game.synopsis && (
                    <p className="text-xs text-text-secondary line-clamp-3 mb-4 leading-relaxed">
                      {game.synopsis.replace(/<\/?[^>]+(>|$)/g, "")}
                    </p>
                  )}

                  <button
                    onClick={() => onSelectGame(game)}
                    className="w-full text-center border border-border hover:border-accent hover:text-accent text-[10px] uppercase tracking-widest font-medium py-1.5 transition-colors btn-micro-bounce"
                  >
                    Open Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
