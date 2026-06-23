const API_URL = '/api/library';

/**
 * Fetch the game library list from backend server
 * @returns {Promise<Array>}
 */
export const fetchLibrary = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching library from server:', error);
    // Fallback to local storage if backend is unreachable
    const localFallback = localStorage.getItem('gt_library_fallback');
    if (localFallback) {
      try {
        return JSON.parse(localFallback);
      } catch (_) {
        return [];
      }
    }
    return [];
  }
};

/**
 * Save the entire library back to backend server
 * @param {Array} library 
 * @returns {Promise<boolean>}
 */
export const saveLibrary = async (library) => {
  try {
    // Keep a backup in localStorage in case server goes down
    localStorage.setItem('gt_library_fallback', JSON.stringify(library));
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(library),
    });
    
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    const result = await response.json();
    return result.success || false;
  } catch (error) {
    console.error('Error saving library to server:', error);
    return false;
  }
};
