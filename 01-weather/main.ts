import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { openMeteoApiClient } from "./utils/openMeteoApiClient.js";
import { getCoordinates } from "./utils/getCoordinates.js";

// --- MCP Server Setup ---

// Create the server
const server = new McpServer({
    name: "weather",
    version: "1.0.0",
    description: "An MCP server to provide weather and related information using Open-Meteo APIs.",
});

// --- Tool Definitions ---

// Tool 1: Fetch current weather
server.tool(
    "get_current_weather",
    "Tool to fetch the current weather of a city",
    {
        city: z.string().describe("The city to fetch the current weather for"),
    },
    async ({ city }) => {
        const geoResult = await getCoordinates(city);
        if (geoResult.error) {
            return { content: [{ type: "text", text: geoResult.error + (geoResult.details ? ` (${geoResult.details})` : "") }] };
        }

        const weatherData = await openMeteoApiClient.fetchWeatherForecast(geoResult.latitude, geoResult.longitude, { current_weather: true });
        if (weatherData.error) {
            return { content: [{ type: "text", text: weatherData.error + (weatherData.details ? ` (${weatherData.details})` : "") }] };
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Current weather for ${geoResult.name}: ${JSON.stringify(weatherData, null, 2)}`,
                },
            ],
        };
    }
);

// Tool 2: Get Daily Weather Forecast
server.tool(
    "get_daily_forecast",
    "Fetches a multi-day weather forecast for a specified city.",
    {
        city: z.string().describe("The city to fetch the weather forecast for"),
        days: z.number().int().min(1).max(16).describe("Number of forecast days (e.g., 1 to 16)")
    },
    async ({ city, days }) => {
        const geoResult = await getCoordinates(city);
        if (geoResult.error) {
            return { content: [{ type: "text", text: geoResult.error + (geoResult.details ? ` (${geoResult.details})` : "") }] };
        }

        const dailyVariables = ["weather_code", "temperature_2m_max", "temperature_2m_min", "precipitation_probability_max", "uv_index_max"];
        const forecastData = await openMeteoApiClient.fetchWeatherForecast(geoResult.latitude, geoResult.longitude, {
            daily: dailyVariables,
            forecast_days: days
        });

        if (forecastData.error) {
            return { content: [{ type: "text", text: forecastData.error + (forecastData.details ? ` (${forecastData.details})` : "") }] };
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Daily forecast for ${geoResult.name} for the next ${days} days: ${JSON.stringify(forecastData, null, 2)}`,
                },
            ],
        };
    }
);

// Tool 3: Get Hourly Weather Forecast for a Specific Date
server.tool(
    "get_hourly_forecast_on_date",
    "Fetches an hourly weather forecast for a city on a specific date.",
    {
        city: z.string().describe("The city to fetch the hourly forecast for"),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("The specific date for the forecast (YYYY-MM-DD)")
    },
    async ({ city, date }) => {
        const geoResult = await getCoordinates(city);
        if (geoResult.error) {
            return { content: [{ type: "text", text: geoResult.error + (geoResult.details ? ` (${geoResult.details})` : "") }] };
        }

        const hourlyVariables = ["temperature_2m", "precipitation_probability", "weather_code", "wind_speed_10m", "relative_humidity_2m"];
        const forecastData = await openMeteoApiClient.fetchWeatherForecast(geoResult.latitude, geoResult.longitude, {
            hourly: hourlyVariables,
            start_date: date,
            end_date: date
        });
        
        if (forecastData.error) {
            return { content: [{ type: "text", text: forecastData.error + (forecastData.details ? ` (${forecastData.details})` : "") }] };
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Hourly forecast for ${geoResult.name} on ${date}: ${JSON.stringify(forecastData, null, 2)}`,
                },
            ],
        };
    }
);

// Tool 4: Get Air Quality Index
server.tool(
    "get_air_quality",
    "Fetches the current air quality index (AQI) and main pollutants for a city.",
    {
        city: z.string().describe("The city to fetch the air quality for")
    },
    async ({ city }) => {
        const geoResult = await getCoordinates(city);
        if (geoResult.error) {
            return { content: [{ type: "text", text: geoResult.error + (geoResult.details ? ` (${geoResult.details})` : "") }] };
        }

        const airQualityVariables = ["european_aqi", "us_aqi", "pm10", "pm2_5", "carbon_monoxide", "nitrogen_dioxide", "ozone"];
        const aqData = await openMeteoApiClient.fetchAirQuality(geoResult.latitude, geoResult.longitude, {
            current: airQualityVariables
        });

        if (aqData.error) {
            return { content: [{ type: "text", text: aqData.error + (aqData.details ? ` (${aqData.details})` : "") }] };
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Current air quality for ${geoResult.name}: ${JSON.stringify(aqData, null, 2)}`,
                },
            ],
        };
    }
);

// --- Start Server ---
(async () => {
    try {
        console.log("Starting Weather MCP Server...");
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.log("Weather MCP Server connected and listening via stdio.");
    } catch (error) {
        console.error("Failed to start Weather MCP Server:", error);
        process.exit(1);
    }
})();