import React from "react";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export function AIPromoCard() {
  const [, setLocation] = useLocation();

  return (
    <button
      type="button"
      onClick={() => setLocation("/request")}
      className="relative flex h-48 cursor-pointer flex-col justify-center overflow-hidden rounded-[32px] bg-gradient-to-br from-[#7A6BF4] to-[#5B4CF2] p-8 text-left text-white shadow-lg transition-shadow hover:shadow-xl"
    >
      <div className="relative z-10 w-2/3">
        <h2 className="mb-2 text-2xl font-bold">
          플랜픽 <span className="font-extrabold italic text-[#C1FE42]">AI</span> 시간표
        </h2>
        <p className="mb-4 text-xs leading-relaxed text-white/80">
          학교ㆍ학과ㆍ학년만 입력하면
          <br />
          AI가 최적의 시간표를 추천합니다.
        </p>
        <span className="flex w-max items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/20">
          시작하기 <ArrowRight className="h-3 w-3" />
        </span>
      </div>
      <div className="absolute bottom-0 right-0 z-0 h-56 w-48 translate-x-4 translate-y-4">
        <img src={`${import.meta.env.BASE_URL}ai-robot.png`} alt="AI Robot" className="h-full w-full translate-x-4 translate-y-4 object-contain object-bottom" />
      </div>
    </button>
  );
}
