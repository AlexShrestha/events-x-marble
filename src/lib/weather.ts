/**
 * Open-Meteo client — free, no API key, no auth.
 * Used by the marble scorer as ephemeral context ("rain on Sunday means indoor only").
 *
 * Docs: https://open-meteo.com/en/docs
 */
import { getUserAgent } from "./user-agent.ts";

const BASE = "https://api.open-meteo.com/v1/forecast";

export interface DailyWeather {
  date: string;          // YYYY-MM-DD
  weather_code: number;  // WMO code
  weather_desc: string;  // human description we map ourselves
  precip_mm: number;
  precip_prob_max: number; // 0-100
  temp_max_c: number;
  temp_min_c: number;
}

const WMO_DESC: Record<number, string> = {
  0: "clear",
  1: "mostly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "rime fog",
  51: "light drizzle",
  53: "moderate drizzle",
  55: "heavy drizzle",
  61: "light rain",
  63: "moderate rain",
  65: "heavy rain",
  66: "freezing rain",
  67: "heavy freezing rain",
  71: "light snow",
  73: "moderate snow",
  75: "heavy snow",
  80: "light showers",
  81: "moderate showers",
  82: "heavy showers",
  95: "thunderstorm",
  96: "thunderstorm w/ hail",
  99: "severe thunderstorm",
};

interface OpenMeteoDailyResponse {
  daily?: {
    time?: string[];
    weather_code?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
  reason?: string;
  error?: boolean;
}

/**
 * Fetch a daily weather forecast for the given lat/lng over `days` days starting today.
 * Returns null on failure — weather is enrichment, not a hard requirement.
 */
export async function fetchDailyForecast(
  lat: number,
  lng: number,
  days: number,
  timezone: string,
): Promise<DailyWeather[] | null> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    timezone,
    forecast_days: String(Math.min(Math.max(days, 1), 16)),
    daily:
      "weather_code,precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min",
  });

  try {
    const res = await fetch(`${BASE}?${params.toString()}`, {
      headers: { "User-Agent": getUserAgent() },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as OpenMeteoDailyResponse;
    if (json.error || !json.daily?.time) return null;

    const d = json.daily;
    return d.time!.map((date, i): DailyWeather => {
      const code = d.weather_code?.[i] ?? 0;
      return {
        date,
        weather_code: code,
        weather_desc: WMO_DESC[code] ?? `code ${code}`,
        precip_mm: d.precipitation_sum?.[i] ?? 0,
        precip_prob_max: d.precipitation_probability_max?.[i] ?? 0,
        temp_max_c: d.temperature_2m_max?.[i] ?? 0,
        temp_min_c: d.temperature_2m_min?.[i] ?? 0,
      };
    });
  } catch {
    return null;
  }
}

/** Format the forecast as compact prompt-context lines. */
export function renderForecastForPrompt(forecast: DailyWeather[]): string {
  if (forecast.length === 0) return "";
  return [
    "WEATHER FORECAST:",
    ...forecast.map((d) => {
      const rainHint = d.precip_prob_max >= 60 || d.precip_mm >= 5 ? " (rain likely — outdoor plans risky)" : "";
      return `  - ${d.date}: ${d.weather_desc}, ${d.temp_min_c.toFixed(0)}–${d.temp_max_c.toFixed(0)}°C, precip ${d.precip_mm.toFixed(1)}mm @ ${d.precip_prob_max}%${rainHint}`;
    }),
  ].join("\n");
}
