import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useLocation } from "wouter";

export function HeroSection() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mb-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          SMART COURSE PLANNING
        </span>
      </div>

      <h1 className="mb-6 text-5xl font-bold leading-[1.15] tracking-tight md:text-6xl">
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

      <p className="mb-8 max-w-[400px] text-lg leading-relaxed text-muted-foreground" style={{ fontFamily: "PlanPickPretendardS", fontWeight: 500 }}>
        AI가 졸업요건과 선호도를 분석해
        <br />
        최적의 시간표를 추천해드려요.
      </p>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => setLocation("/contests")}
          className="rounded-xl bg-[#C8F527] px-6 py-6 text-base font-medium text-white shadow-md hover:bg-[#B0DB18]"
          data-testid="btn-contests"
        >
          공모전 바로가기
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" className="rounded-xl border-slate-300 px-6 py-6 text-base font-medium text-slate-700 hover:bg-slate-50" data-testid="btn-guide">
          수강신청 가이드
          <Play className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
