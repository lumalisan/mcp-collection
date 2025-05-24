/**
 * Fetches geographic coordinates for a given city.
 * @param {string} city - The name of the city.
 * @returns {Promise<{latitude: number, longitude: number, name: string} | {error: string, details?: string}>}
 */
export const getCoordinates = async (city: string) => {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        if (!response.ok) {
            return { error: `Geocoding API request failed with status ${response.status}` };
        }
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            return { error: `City "${city}" not found by geocoding service.` };
        }
        const { latitude, longitude, name: resolvedName } = data.results[0];
        return { latitude, longitude, name: resolvedName || city };
    } catch (error) {
        return { error: "Geocoding request failed.", details: error.message };
    }
}