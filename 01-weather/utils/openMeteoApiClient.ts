/**
 * Client object to interact with the Open-Meteo APIs.
 */
export const openMeteoApiClient = {
    /**
     * Fetches weather forecast data.
     * @param {number} latitude
     * @param {number} longitude
     * @param {object} options - Forecast options (current_weather, daily, hourly, etc.)
     * @returns {Promise<any | {error: string, details?: string}>}
     */
    async fetchWeatherForecast(latitude: number, longitude: number, options: any) {
        try {
            const params = new URLSearchParams();
            params.append("latitude", latitude.toString());
            params.append("longitude", longitude.toString());
            if (options.current_weather) params.append("current_weather", "true");
            if (options.daily && options.daily.length > 0) params.append("daily", options.daily.join(","));
            if (options.hourly && options.hourly.length > 0) params.append("hourly", options.hourly.join(","));
            if (options.forecast_days) params.append("forecast_days", options.forecast_days.toString());
            if (options.start_date) params.append("start_date", options.start_date);
            if (options.end_date) params.append("end_date", options.end_date);
            params.append("timezone", options.timezone || "auto");

            const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
            if (!response.ok) {
                const errorData = await response.json();
                return { error: `Open-Meteo Forecast API request failed with status ${response.status}`, details: errorData.reason };
            }
            return await response.json();
        } catch (error) {
            return { error: "Open-Meteo Forecast request failed.", details: error.message };
        }
    },

    /**
     * Fetches air quality data.
     * @param {number} latitude
     * @param {number} longitude
     * @param {object} options - Air quality options (current parameters)
     * @returns {Promise<any | {error: string, details?: string}>}
     */
    async fetchAirQuality(latitude: number, longitude: number, options: any) {
        try {
            const params = new URLSearchParams();
            params.append("latitude", latitude.toString());
            params.append("longitude", longitude.toString());
            if (options.current && options.current.length > 0) params.append("current", options.current.join(","));
            
            const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`);
            if (!response.ok) {
                const errorData = await response.json();
                return { error: `Open-Meteo Air Quality API request failed with status ${response.status}`, details: errorData.reason };
            }
            return await response.json();
        } catch (error) {
            return { error: "Open-Meteo Air Quality request failed.", details: error.message };
        }
    }
};