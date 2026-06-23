const BASE_URL = 'https://api.rawg.io/api';

const getApiKey = () => {
  return localStorage.getItem('gt_api_key') || '';
};

/**
 * Search games via RAWG API
 * @param {string} query 
 * @returns {Promise<Array>} List of games
 */
export const searchGames = async (query, signal) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('RAWG API key is not configured.');
  }
  
  const url = `${BASE_URL}/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=20`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid RAWG API key. Please check your settings.');
    }
    throw new Error('Failed to search games from RAWG.');
  }
  const data = await response.json();
  return data.results || [];
};

/**
 * Fetch detailed game specifications from RAWG API (for synopsis, developers, etc.)
 * @param {number|string} id 
 * @returns {Promise<Object>} Game details
 */
export const getGameDetails = async (id, signal) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('RAWG API key is not configured.');
  }
  
  const url = `${BASE_URL}/games/${id}?key=${apiKey}`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error('Failed to fetch detailed game metrics from RAWG.');
  }
  return await response.json();
};
