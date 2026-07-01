import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { TimetableCard } from "@/components/home/TimetableCard";
import { AIPromoCard } from "@/components/home/AIPromoCard";
import { LiveStatusCard } from "@/components/home/LiveStatusCard";
import { WeatherCard } from "@/components/home/WeatherCard";
import { FeatureIcons } from "@/components/home/FeatureIcons";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f4f2fc] p-6 font-sans md:p-8 lg:p-10">
      <div className="pointer-events-none fixed right-0 top-0 -z-10 h-[600px] w-[800px] translate-x-1/4 -translate-y-1/4 rounded-full bg-[#F2EFFF] opacity-60 blur-[100px]" />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 pb-10">
        <div className="flex flex-col items-stretch gap-8 xl:flex-row">
          <div className="z-10 flex min-w-[320px] flex-1 flex-col justify-center">
            <HeroSection />
          </div>
          <div className="relative flex min-h-[400px] flex-[1.5] items-center justify-center">
            <TimetableCard />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_270px_190px]">
          <AIPromoCard />
          <LiveStatusCard />
          <WeatherCard />
        </div>

        <FeatureIcons />
      </div>
    </div>
  );
}
