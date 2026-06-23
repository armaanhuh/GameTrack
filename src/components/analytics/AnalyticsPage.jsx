import React, { useMemo } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import { getAnalyticsData } from '../../services/stats';

export default function AnalyticsPage() {
  const { library } = useLibrary();
  
  // Memoize analytics datasets to prevent heavy chart re-computations
  const data = useMemo(() => getAnalyticsData(library), [library]);

  const totalGames = library.length;
  const totalHours = useMemo(() => library.reduce((sum, g) => sum + Number(g.playtimeHours || 0), 0), [library]);

  // 1. Setup Monthly Bar Chart Math
  const maxHours = Math.max(...data.monthlyLogs.map(log => log.hours), 10);
  const chartHeight = 160;
  const chartWidth = 500;
  const barPadding = 20;
  const barWidth = (chartWidth - barPadding * (data.monthlyLogs.length + 1)) / data.monthlyLogs.length;

  // 2. Setup Genre Donut Chart Math
  const totalGenreCounts = data.genres.reduce((sum, g) => sum + g.count, 0);
  const donutRadius = 40;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~251.3
  
  // Custom color palette for donut sectors to match print editorial (warm accent gradients)
  const donutColors = [
    'var(--color-accent)', // Accent
    '#5a5a5a',             // Muted charcoal
    '#888888',             // Gray
    '#b0b0b0',             // Light gray
    '#3b82f6'              // Accent-blue highlight
  ];

  // 3. Platform Distribution Math
  const maxPlatformHours = Math.max(...data.platforms.map(p => p.hours), 1);
  const maxPlatformCount = Math.max(...data.platforms.map(p => p.count), 1);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-4xl font-display font-bold text-text mb-2">Analytics Desk</h1>
        <p className="text-text-secondary text-sm">Visual reports detailing genre distributions and play trends.</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
        <div className="bg-surface p-6 text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-1">Average Playtime per Game</p>
          <p className="text-3xl font-display font-semibold text-text">
            {totalGames > 0 ? (totalHours / totalGames).toFixed(1) : 0} <span className="text-sm font-sans text-text-secondary">hrs</span>
          </p>
        </div>
        <div className="bg-surface p-6 text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-1">Most Active Genre</p>
          <p className="text-3xl font-display font-semibold text-accent">
            {data.genres[0] ? data.genres[0].name : 'N/A'}
          </p>
        </div>
      </div>

      {/* Grid: Bar Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Monthly Activity Log (Bar Chart) */}
        <div className="border border-border bg-surface p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-lg font-display font-semibold text-text">Monthly Activity Log</h2>
            <p className="text-xs text-text-secondary">Cumulative playtime hours tracked over the last 6 months.</p>
          </div>

          {totalHours === 0 ? (
            <div className="py-20 text-center text-text-secondary text-xs font-sans border border-dashed border-border">
              No playtime logs registered.
            </div>
          ) : (
            <div className="w-full flex justify-center items-end py-4">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full max-w-md h-auto overflow-visible">
                {/* Horizontal reference lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                  const y = chartHeight - (val * chartHeight);
                  return (
                    <g key={idx}>
                      <line
                        x1="0"
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke="var(--color-border)"
                        strokeDasharray="2 4"
                      />
                      <text
                        x="-10"
                        y={y + 4}
                        fill="var(--color-text-secondary)"
                        className="text-[9px] font-mono text-right"
                        textAnchor="end"
                      >
                        {Math.round(val * maxHours)}h
                      </text>
                    </g>
                  );
                })}

                {/* Bars */}
                {data.monthlyLogs.map((log, index) => {
                  const x = barPadding + index * (barWidth + barPadding);
                  const barHeight = (log.hours / maxHours) * chartHeight;
                  const y = chartHeight - barHeight;

                  return (
                    <g key={index} className="group">
                      {/* Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill="var(--color-accent)"
                        className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                      />
                      {/* Value label on hover */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        textAnchor="middle"
                        fill="var(--color-text)"
                        className="text-[9px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {log.hours}h
                      </text>
                      {/* Month label */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight + 16}
                        textAnchor="middle"
                        fill="var(--color-text-secondary)"
                        className="text-[9px] uppercase tracking-widest font-sans"
                      >
                        {log.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Genre Distribution (Donut Chart) */}
        <div className="border border-border bg-surface p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-lg font-display font-semibold text-text">Genre distribution</h2>
            <p className="text-xs text-text-secondary">Dominant genres parsed from your collection library.</p>
          </div>

          {totalGames === 0 ? (
            <div className="py-20 text-center text-text-secondary text-xs font-sans border border-dashed border-border">
              No games in library to compute genres.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
              
              {/* Donut SVG */}
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r={donutRadius}
                    fill="transparent"
                    stroke="var(--color-border)"
                    strokeWidth="12"
                  />
                  
                  {/* Segments */}
                  {(() => {
                    let accumulatedPercent = 0;
                    return data.genres.map((genre, idx) => {
                      const percent = genre.count / totalGenreCounts;
                      const strokeDasharray = `${percent * donutCircumference} ${donutCircumference}`;
                      const strokeDashoffset = -accumulatedPercent * donutCircumference;
                      accumulatedPercent += percent;
                      
                      return (
                        <circle
                          key={genre.name}
                          cx="50"
                          cy="50"
                          r={donutRadius}
                          fill="transparent"
                          stroke={donutColors[idx % donutColors.length]}
                          strokeWidth="12"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300 hover:stroke-[14px] cursor-pointer"
                        />
                      );
                    });
                  })()}
                </svg>
                {/* Center Stats */}
                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                  <span className="text-xs text-text-secondary uppercase tracking-widest leading-none">Genres</span>
                  <span className="text-2xl font-display font-bold text-text mt-0.5">{data.genres.length}</span>
                </div>
              </div>

              {/* Legends Table */}
              <div className="space-y-2.5 text-xs w-full max-w-[200px]">
                {data.genres.map((genre, idx) => {
                  const percent = totalGenreCounts > 0 ? Math.round((genre.count / totalGenreCounts) * 100) : 0;
                  return (
                    <div key={genre.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <span
                          className="w-2.5 h-2.5 shrink-0"
                          style={{ backgroundColor: donutColors[idx % donutColors.length] }}
                        />
                        <span className="text-text font-semibold truncate">{genre.name}</span>
                      </div>
                      <span className="text-text-secondary font-mono text-[10px] pl-2">{percent}% ({genre.count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform Distribution Row (Horizontal Bar Chart) */}
      <div className="border border-border bg-surface p-6">
        <div className="mb-6">
          <h2 className="text-lg font-display font-semibold text-text">Platform distribution</h2>
          <p className="text-xs text-text-secondary">Comparison of playtime investments and collection size per ecosystem.</p>
        </div>

        {totalGames === 0 ? (
          <div className="py-12 text-center text-text-secondary text-xs font-sans border border-dashed border-border">
            Add games to check platform metrics.
          </div>
        ) : (
          <div className="space-y-6">
            {data.platforms.map((plat) => {
              // Percentage bar sizing
              const timePercent = Math.max(5, Math.round((plat.hours / maxPlatformHours) * 100));
              const countPercent = Math.max(5, Math.round((plat.count / maxPlatformCount) * 100));

              return (
                <div key={plat.name} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
                  {/* Name label */}
                  <div className="md:col-span-1">
                    <span className="text-sm font-semibold text-text">{plat.name}</span>
                  </div>

                  {/* Playtime Bar */}
                  <div className="md:col-span-2 space-y-1">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-text-secondary font-mono">
                      <span>Playtime Hours ({plat.hours} hrs)</span>
                      <span>Ecosystem Weight</span>
                    </div>
                    {/* Horizontal Bar */}
                    <div className="w-full h-2.5 bg-bg border border-border rounded overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-500"
                        style={{ width: `${timePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Games Count Bar */}
                  <div className="md:col-span-1 space-y-1">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-text-secondary font-mono">
                      <span>Games ({plat.count})</span>
                    </div>
                    <div className="w-full h-2.5 bg-bg border border-border rounded overflow-hidden">
                      <div
                        className="h-full bg-text-secondary transition-all duration-500"
                        style={{ width: `${countPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
