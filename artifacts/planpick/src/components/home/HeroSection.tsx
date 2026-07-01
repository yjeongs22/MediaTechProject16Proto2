import React from "react";
import { ArrowRight, CirclePlay, Zap } from "lucide-react";
import { useLocation } from "wouter";

export function HeroSection() {
  const [, setLocation] = useLocation();

  return (
    <section>
      <div className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-[#5B4CF2]">
        <Zap className="h-4 w-4 fill-[#5B4CF2]" />
        <span>SMART COURSE PLANNING</span>
      </div>
      <h1 className="mb-6 text-5xl font-extrabold leading-[1.2] tracking-tight text-[#1F1543] lg:text-6xl">
        스마트한
        <br />
        <span className="text-[#5B4CF2]">수강신청</span>,
        <br />
        AI가 챙기기
      </h1>
      <p className="mb-10 max-w-md text-base leading-relaxed text-gray-500">
        AI가 당신의 졸업요건과 선호도를 분석하여
        <br />
        최적의 시간표를 추천해드려요.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setLocation("/request")}
          className="flex items-center gap-3 rounded-full bg-[#C1FE42] px-6 py-4 font-bold text-[#1F1543] transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          최적 시간표 추천받기
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F1543] text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
        <button
          type="button"
          onClick={() => setLocation("/request")}
          className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-6 py-4 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
        >
          수강신청 가이드
          <CirclePlay className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </section>
  );
}
