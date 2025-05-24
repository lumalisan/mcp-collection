import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { handleGetAbilityInformation, handleGetMoveInformation, handleGetPokemon } from "./utils/pokemonTools.ts";

// --- MCP Server Setup ---

// Create the MCP server instance
const server = new McpServer({
    name: "pokemon",
    version: "1.0.0",
    description: "An MCP server to provide detailed Pokémon information from PokéAPI.",
});

// --- Tool Definitions ---

// Tool 1: Fetch Pokemon information
server.tool(
    "get_pokemon_details",
    "Fetches detailed information for a specific Pokémon (ID, height, weight, types, abilities, base experience, forms, stats, and some moves).",
    {
        pokemon: z.string().describe("The name or ID of the Pokémon to fetch information for (e.g., 'pikachu' or '25')."),
    },
    handleGetPokemon
);

// Tool 2: Fetch ability information
server.tool(
    "get_ability_details",
    "Fetches details for a Pokémon ability, including its effect and Pokémon that can have it.",
    {
        ability: z.string().describe("The name or ID of the ability (e.g., 'stench' or '1')."),
    },
    handleGetAbilityInformation
);

// Tool 3: Fetch move information
server.tool(
    "get_move_details",
    "Fetches details for a Pokémon move, including accuracy, effect, type, and Pokémon that can learn it.",
    {
        move: z.string().describe("The name or ID of the move (e.g., 'mega-punch' or '5')."),
    },
    handleGetMoveInformation
);

// --- Start Server ---
(async () => {
    try {
        console.log("Starting Pokémon MCP Server...");
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.log("Pokémon MCP Server connected and listening via stdio...");
    } catch (error) {
        console.error("Failed to start Pokémon MCP Server:", error);
        process.exit(1);
    }
})();