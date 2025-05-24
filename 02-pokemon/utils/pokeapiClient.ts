const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * A generic fetch wrapper for the PokéAPI.
 * @param {string} endpoint - The API endpoint (e.g., "pokemon/ditto").
 * @returns {Promise<object>} The JSON response from the API.
 * @throws {Error} If the API request fails or the resource is not found.
 */
const fetchFromPokeApi = async (endpoint: string) => {
    const response = await fetch(`${POKEAPI_BASE_URL}/${endpoint}`);
    if (!response.ok) {
        throw new Error(`Resource at "${endpoint}" not found or API request failed (${response.status}).`);
    }
    return response.json();
}

export const pokeapiClient = {
    async getPokemon(nameOrId: string) {
        return fetchFromPokeApi(`pokemon/${nameOrId.toLowerCase()}`);
    },
    async getAbility(nameOrId: string) {
        return fetchFromPokeApi(`ability/${nameOrId.toLowerCase()}`);
    },
    async getMove(nameOrId: string) {
        return fetchFromPokeApi(`move/${nameOrId.toLowerCase()}`);
    },
};