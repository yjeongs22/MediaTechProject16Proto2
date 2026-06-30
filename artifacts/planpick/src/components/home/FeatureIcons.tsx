import React from "react";
import { BellRing, Bot, GraduationCap, RefreshCcw, Star } from "lucide-react";

const features = [
  {
    icon: <Bot className="h-6 w-6 text-indigo-600" />,
    title: "AI 시간표 추천",
    desc: "개인 맞춤 최적 시간표",
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-purple-600" />,
    title: "졸업요건 관리",
    desc: "실시간 이수 현황 확인",
  },
  {
    icon: <BellRing className="h-6 w-6 text-blue-500" />,
    title: "수강신청 지원",
    desc: "대기순번과 알림 서비스",
  },
  {
    icon: <RefreshCcw className="h-6 w-6 text-emerald-500" />,
    title: "대체 플랜 제안",
    desc: "신청 실패 시 대안 제시",
  },
  {
    icon: <Star className="h-6 w-6 text-amber-500" />,
    title: "강의 평가 분석",
    desc: "후기 기반 강의 추천",
  },
];

export function FeatureIcons() {
  return (
    <div className="mt-4 grid w-full grid-cols-2 gap-4 border-t border-slate-200/60 py-8 md:grid-cols-5 lg:gap-6">
      {features.map((item, i) => (
        <div key={item.title} className="group flex cursor-pointer flex-col items-center text-center" data-testid={`feature-icon-${i}`}>
          <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
            <div className="absolute inset-0 rounded-2xl bg-slate-50/50 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10">{item.icon}</div>
          </div>
          <h4 className="mb-1 text-sm font-bold text-slate-800">{item.title}</h4>
          <p className="text-xs text-slate-500">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
