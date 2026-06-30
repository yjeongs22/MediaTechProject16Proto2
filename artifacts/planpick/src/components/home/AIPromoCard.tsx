import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export function AIPromoCard() {
  const [, setLocation] = useLocation();

  return (
    <Card className="relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
      <CardContent className="relative z-10 flex h-full items-center justify-between p-6 pb-[50px] pt-[50px] md:p-8 md:pb-[50px] md:pt-[50px]">
        <div className="max-w-[70%]">
          <h3 className="mb-2 text-2xl font-bold" style={{ fontFamily: "PlanPickAggro", fontWeight: 500 }}>플랜픽 AI 시간표</h3>
          <p className="mb-6 text-sm leading-relaxed text-indigo-100">학교, 학과, 학년 정보를 바탕으로 AI가 최적의 시간표를 추천합니다.</p>
          <button
            onClick={() => setLocation("/request")}
            className="flex items-center rounded-full border border-white/30 bg-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/30"
            data-testid="btn-ai-start"
          >
            시작하기 <ArrowRight className="ml-1.5 h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-shrink-0">
          <img src={`${import.meta.env.BASE_URL}robot.png`} alt="AI 로봇" className="ml-[20px] mr-[20px] h-32 w-32 object-contain drop-shadow-xl" />
          <div className="absolute -left-6 top-0 animate-bounce rounded-2xl rounded-br-sm bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm">
            ...
          </div>
        </div>
      </CardContent>
      <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-purple-400/20 blur-2xl" />
    </Card>
  );
}
