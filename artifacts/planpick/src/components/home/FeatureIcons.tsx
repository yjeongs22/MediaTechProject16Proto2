import React from "react";
import { ArrowRightLeft, Bell, GraduationCap, Star, WandSparkles } from "lucide-react";

const features = [
  { icon: WandSparkles, title: "AI 시간표 추천", desc: "개인 맞춤 최적 시간표" },
  { icon: GraduationCap, title: "졸업 요건 관리", desc: "실시간 이수 현황 확인" },
  { icon: Bell, title: "수강신청 지원", desc: "대기순번 & 알림 서비스" },
  { icon: ArrowRightLeft, title: "대체 플랜 제안", desc: "신청 실패 시 대안 제시" },
  { icon: Star, title: "강의 평가 분석", desc: "후기 기반 강의 추천" },
];

export function FeatureIcons() {
  return (
    <section className="mt-2 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-nowrap">
      {features.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50 lg:w-auto lg:border-r lg:border-gray-100 lg:px-4 lg:last:border-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2EFFF] text-[#5B4CF2]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800">{title}</h4>
            <p className="text-[11px] text-gray-500">{desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
