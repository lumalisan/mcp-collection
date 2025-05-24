import { pokeapiClient } from "./pokeapiClient.ts";

/**
 * Handles the logic for the 'get_pokemon' tool.
 */
export const handleGetPokemon = async ({ pokemon }: { pokemon: string }) => {
    try {
        const data = await pokeapiClient.getPokemon(pokemon);
        const { id, height, weight, types, abilities, base_experience, forms, stats, moves } = data;

        const pokemonInfo = {
            id,
            name: data.name,
            height,
            weight,
            types: types.map((type) => type.type.name),
            abilities: abilities.map((ability) => ability.ability.name),
            base_experience,
            forms: forms.map((form) => form.name),
            stats: stats.map((stat) => ({ name: stat.stat.name, value: stat.base_stat })),
            moves: moves.slice(0, 20).map((move) => move.move.name),
        };
        
        return {
            content: [{
                type: "text",
                text: `Pokemon "${pokemonInfo.name}": ${JSON.stringify(pokemonInfo, null, 2)}`,
            }],
        };
    } catch (error) {
        return { content: [{ type: "text", text: `Could not fetch information for Pokémon "${pokemon}". ${error.message}` }] };
    }
}

/**
 * Handles the logic for the 'get_ability_information' tool.
 */
export const handleGetAbilityInformation = async ({ ability }: { ability: string }) => {
    try {
        const data = await pokeapiClient.getAbility(ability);
        const { effect_entries, pokemon: pokemonWithAbility, name: abilityName } = data;

        const pokemonAbilityInfo = {
            name: abilityName,
            effect_entries: effect_entries
                .filter((entry) => entry.language.name === "en")
                .map((entry) => entry.effect.trim()),
            pokemons: pokemonWithAbility.map((p) => p.pokemon.name),
        };

        return {
            content: [{
                type: "text",
                text: `Ability "${pokemonAbilityInfo.name}": ${JSON.stringify(pokemonAbilityInfo, null, 2)}`,
            }],
        };
    } catch (error) {
        return { content: [{ type: "text", text: `Could not fetch information for ability "${ability}". ${error.message}` }] };
    }
}

/**
 * Handles the logic for the 'get_move_information' tool.
 */
export const handleGetMoveInformation = async ({ move }: { move: string }) => {
    try {
        const data = await pokeapiClient.getMove(move);
        const { accuracy, effect_entries, learned_by_pokemon, damage_class, target, type, name: moveName } = data;

        const pokemonMoveInfo = {
            name: moveName,
            accuracy,
            effect_entries: effect_entries
                .filter((entry) => entry.language.name === "en")
                .map((entry) => entry.effect.trim()),
            damage_class: damage_class.name,
            target: target.name,
            type: type.name,
            learned_by_pokemon: learned_by_pokemon.map((p) => p.name),
        };

        return {
            content: [{
                type: "text",
                text: `Move "${pokemonMoveInfo.name}": ${JSON.stringify(pokemonMoveInfo, null, 2)}`,
            }],
        };
    } catch (error) {
        return { content: [{ type: "text", text: `Could not fetch information for move "${move}". ${error.message}` }] };
    }
}