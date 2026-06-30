import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { TimetableCard } from "@/components/home/TimetableCard";
import { AIPromoCard } from "@/components/home/AIPromoCard";
import { LiveStatusCard } from "@/components/home/LiveStatusCard";
import { WeatherCard } from "@/components/home/WeatherCard";
import { FeatureIcons } from "@/components/home/FeatureIcons";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F0F2F8] p-6 md:p-8 lg:p-10 font-sans">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
        
        {/* Top Section: Hero + Floating Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left: Hero Typography */}
          <div className="lg:col-span-5 h-full">
            <HeroSection />
          </div>
          
          {/* Right: Timetable Image */}
          <div className="lg:col-span-7 flex items-center justify-center">
            <TimetableCard />
          </div>
        </div>

        {/* Middle Section: AI Promo + Status + Notices */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          <div className="lg:col-span-7">
            <AIPromoCard />
          </div>
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <LiveStatusCard />
            <WeatherCard />
          </div>
        </div>

        {/* Bottom Section: Feature Icons */}
        <FeatureIcons />
        
      </div>
    </div>
  );
}
