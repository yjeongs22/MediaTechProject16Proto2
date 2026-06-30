import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CloudSun, LocateFixed, MapPin, RefreshCw } from "lucide-react";

type WeatherState = {
  loading: boolean;
  error: string | null;
  city: string;
  temperature: number | null;
  humidity: number | null;
  wind: number | null;
  code: number | null;
};

const fallbackCoords = { latitude: 37.5665, longitude: 126.978 };

function describeWeather(code: number | null) {
  if (code === null) return "날씨 확인 중";
  if (code === 0) return "맑음";
  if ([1, 2, 3].includes(code)) return "구름 조금";
  if ([45, 48].includes(code)) return "안개";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "비";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "눈";
  if ([95, 96, 99].includes(code)) return "천둥";
  return "흐림";
}

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherState>({
    loading: true,
    error: null,
    city: "현재 위치",
    temperature: null,
    humidity: null,
    wind: null,
    code: null,
  });

  const summary = useMemo(() => describeWeather(weather.code), [weather.code]);

  async function loadWeather(coords = fallbackCoords, city = "서울 기준") {
    setWeather((prev) => ({ ...prev, loading: true, error: null, city }));
    try {
      const params = new URLSearchParams({
        latitude: String(coords.latitude),
        longitude: String(coords.longitude),
        current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
        timezone: "auto",
      });
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
      if (!res.ok) throw new Error("weather");
      const data = await res.json();
      setWeather({
        loading: false,
        error: null,
        city,
        temperature: Math.round(data.current.temperature_2m),
        humidity: Math.round(data.current.relative_humidity_2m),
        wind: Math.round(data.current.wind_speed_10m),
        code: data.current.weather_code,
      });
    } catch {
      setWeather({
        loading: false,
        error: "날씨 정보를 불러오지 못했어요.",
        city,
        temperature: null,
        humidity: null,
        wind: null,
        code: null,
      });
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      void loadWeather(fallbackCoords, "서울 기준");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void loadWeather(
          {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          "내 위치"
        );
      },
      () => {
        void loadWeather(fallbackCoords, "서울 기준");
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 1000 * 60 * 10 }
    );
  }

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <Card className="h-full rounded-2xl border border-slate-100 shadow-sm">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">지역별 날씨</h3>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
              <MapPin className="h-3 w-3" />
              {weather.city}
            </p>
          </div>
          <button
            type="button"
            onClick={requestLocation}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            aria-label="날씨 새로고침"
          >
            {weather.loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-4">
          <div className="flex items-start justify-between">
            <CloudSun className="h-9 w-9 text-indigo-500" />
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-600 shadow-sm">
              {summary}
            </span>
          </div>

          {weather.error ? (
            <p className="mt-5 text-sm font-bold text-slate-500">{weather.error}</p>
          ) : (
            <div className="mt-5">
              <div className="text-4xl font-black text-slate-900">
                {weather.temperature === null ? "--" : weather.temperature}
                <span className="text-xl">℃</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                <span>습도 {weather.humidity ?? "--"}%</span>
                <span>바람 {weather.wind ?? "--"}km/h</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
