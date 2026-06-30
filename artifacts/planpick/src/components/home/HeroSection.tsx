import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useLocation } from "wouter";

export function HeroSection() {
  const [, setLocation] = useLocation();
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="mb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold tracking-wider uppercase border border-slate-200">
          <span className="text-amber-400">⚡</span> SMART COURSE PLANNING
        </span>
      </div>
      
      <h1 className="text-5xl md:text-6xl font-bold leading-[1.15] tracking-tight mb-6">
        <span className="block text-slate-900" style={{ fontFamily: "PlanPickPretendard", fontWeight: 700 }}>
          더 스마트한
        </span>
        <span className="block text-indigo-600" style={{ fontFamily: "PlanPickAggro", fontWeight: 900 }}>
          수강신청,
        </span>
        <span className="block text-slate-900" style={{ fontFamily: "PlanPickPretendard", fontWeight: 700 }}>
          더 완벽한 학기
        </span>
      </h1>
      
      <p className="text-muted-foreground text-lg mb-8 max-w-[400px] leading-relaxed">
        AI가 당신의 졸업요건과 선호도를 분석하여<br />
        최적의 시간표를 추천해드려요.
      </p>
      
      <div className="flex items-center gap-3">
        <Button onClick={() => setLocation("/request")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-6 text-base font-medium rounded-xl shadow-md" data-testid="btn-get-recommendation">
          최적 시간표 추천받기 <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
        <Button variant="outline" className="px-6 py-6 text-base font-medium rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50" data-testid="btn-guide">
          수강신청 가이드 <Play className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
