/**
 * Helper to parse a date string safely
 * @param {string} dateStr 
 * @returns {Date|null}
 */
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Format playtime decimal hours as a user-friendly string (e.g. 10h 30m, 12 hrs, 45 mins)
 * @param {number} decimalHours 
 * @returns {string}
 */
export const formatPlaytime = (decimalHours) => {
  if (!decimalHours || decimalHours <= 0) return '0 hrs';
  const hrs = Math.floor(decimalHours);
  const mins = Math.round((decimalHours % 1) * 60);
  
  if (hrs > 0 && mins > 0) {
    return `${hrs}h ${mins}m`;
  } else if (hrs > 0) {
    return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`;
  } else {
    return `${mins} mins`;
  }
};

/**
 * Get all timeline events from library games
 * @param {Array} library 
 * @param {number} [limit=15] Max activities to return (null for all)
 * @returns {Array} List of activity events sorted newest first
 */
export const getRecentActivity = (library, limit = 15) => {
  const activities = [];

  library.forEach(game => {
    if (game.dateAdded) {
      activities.push({
        id: `${game.id}-added`,
        gameId: game.id,
        title: game.title,
        date: parseDate(game.dateAdded),
        dateStr: game.dateAdded,
        type: 'added',
        description: `Added "${game.title}" to backlog.`
      });
    }
    if (game.yourRating && game.dateAdded) {
      activities.push({
        id: `${game.id}-rated`,
        gameId: game.id,
        title: game.title,
        date: parseDate(game.dateAdded),
        dateStr: game.dateAdded,
        type: 'rated',
        description: `Rated "${game.title}" ${game.yourRating}/10.`
      });
    }
  });

  const sorted = activities
    .filter(a => a.date !== null)
    .sort((a, b) => b.date - a.date);

  return limit ? sorted.slice(0, limit) : sorted;
};

/**
 * Calculates current streak of consecutive active days
 * @param {Array} library 
 * @returns {number}
 */
export const calculatePlayingStreak = (library) => {
  const activities = getRecentActivity(library, null);
  if (activities.length === 0) return 0;

  // Extract all unique dates formatted as YYYY-MM-DD
  const activeDates = new Set(
    activities.map(act => act.dateStr).filter(Boolean)
  );

  if (activeDates.size === 0) return 0;

  // Start checking from today backwards
  let streak = 0;
  const today = new Date();
  
  // Normalize today to YYYY-MM-DD in local time
  const formatDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  let checkDate = new Date(today);
  let dateStr = formatDateStr(checkDate);

  // If today is not active, check yesterday. If yesterday is also not active, streak is 0.
  if (!activeDates.has(dateStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
    dateStr = formatDateStr(checkDate);
  }

  // Count backwards
  while (activeDates.has(dateStr)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
    dateStr = formatDateStr(checkDate);
  }

  return streak;
};

/**
 * Group games by platform categories
 * Categories: Steam, Epic, Xbox
 * @param {Array} library 
 * @returns {Object} Grouped platform stats
 */
export const groupByPlatform = (library) => {
  const platforms = {
    Steam: { name: 'Steam', games: [], hours: 0, completed: 0 },
    Epic: { name: 'Epic Games', games: [], hours: 0, completed: 0 },
    Xbox: { name: 'Xbox', games: [], hours: 0, completed: 0 },
    EA: { name: 'EA App', games: [], hours: 0, completed: 0 }
  };

  library.forEach(game => {
    const owned = game.platformsOwned || [];
    
    // Flags to prevent double counting in the same category
    let isSteam = false;
    let isEpic = false;
    let isXbox = false;
    let isEA = false;

    owned.forEach(plat => {
      const p = plat.toLowerCase();
      if (p === 'steam') {
        isSteam = true;
      } else if (p === 'epic') {
        isEpic = true;
      } else if (p === 'xbox') {
        isXbox = true;
      } else if (p === 'ea') {
        isEA = true;
      }
    });

    const addStats = (group) => {
      group.games.push(game);
      group.hours = Math.round((group.hours + Number(game.playtimeHours || 0)) * 10) / 10;
      if (game.status === 'completed') {
        group.completed += 1;
      }
    };

    if (isSteam) addStats(platforms.Steam);
    if (isEpic) addStats(platforms.Epic);
    if (isXbox) addStats(platforms.Xbox);
    if (isEA) addStats(platforms.EA);
  });

  // Calculate percentages
  Object.keys(platforms).forEach(key => {
    const p = platforms[key];
    const completionTotal = p.games.filter(g => g.status !== 'multiplayer' && g.status !== 'endless').length;
    p.completionRate = completionTotal > 0 ? Math.round((p.completed / completionTotal) * 100) : 0;
  });

  return platforms;
};

/**
 * Calculate analytics metrics
 * @param {Array} library 
 * @returns {Object} Data ready for visualization
 */
export const getAnalyticsData = (library) => {
  // 1. Genre distribution
  const genresMap = {};
  library.forEach(game => {
    const genres = game.genres || [];
    genres.forEach(g => {
      genresMap[g] = (genresMap[g] || 0) + 1;
    });
  });

  const genres = Object.keys(genresMap)
    .map(name => ({ name, count: genresMap[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // top 5 genres

  // 2. Monthly activity logs (last 6 months)
  const monthlyLogs = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Build last 6 months list
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthlyLogs.push({
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      label: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`,
      hours: 0
    });
  }

  // Populate monthly playtime hours based on activity date
  library.forEach(game => {
    const hours = Number(game.playtimeHours || 0);
    if (hours === 0) return;

    // Use dateAdded
    const rawDate = game.dateAdded;
    const date = parseDate(rawDate);
    if (!date) return;

    const gameYear = date.getFullYear();
    const gameMonth = date.getMonth();

    // Check if it fits in our 6 month window
    const targetLog = monthlyLogs.find(log => log.year === gameYear && log.monthIndex === gameMonth);
    if (targetLog) {
      targetLog.hours = Math.round((targetLog.hours + hours) * 10) / 10;
    }
  });

  // 3. Platform comparison stats
  const platformStats = groupByPlatform(library);
  const platformChartData = Object.keys(platformStats).map(key => ({
    name: platformStats[key].name,
    hours: platformStats[key].hours,
    count: platformStats[key].games.length
  }));

  return {
    genres,
    monthlyLogs,
    platforms: platformChartData
  };
};
