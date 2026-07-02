import React, { useMemo, useState } from "react";
import { CalendarDays, CheckCircle, ChevronDown, Heart, Search, Sparkles, Star, TrendingUp, WalletCards } from "lucide-react";
import { getCurrentUserName } from "@/lib/auth";

type Scholarship = {
  id: string;
  name: string;
  amount: string;
  period: string;
  type: string;
  match: number;
  summary: string;
  requirements: string[];
  icon: React.ReactNode;
  iconClassName: string;
};

const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "future-talent",
    name: "미래인재 성장 장학금",
    amount: "최대 200만원",
    period: "2026.07.01 ~ 2026.07.24",
    type: "성적/역량",
    match: 96,
    summary: "전공 프로젝트와 학업 성취를 함께 평가하는 장학금입니다.",
    requirements: ["직전 학기 12학점 이상 이수", "평점 3.5 이상", "전공 활동 증빙 제출"],
    icon: <TrendingUp className="h-12 w-12" />,
    iconClassName: "bg-indigo-50 text-indigo-400",
  },
  {
    id: "media-tech",
    name: "미디어테크 실무 장학금",
    amount: "150만원",
    period: "2026.07.10 ~ 2026.08.02",
    type: "전공특화",
    match: 91,
    summary: "AI, UX, 시각미디어 분야 활동 경험이 있는 학생에게 적합합니다.",
    requirements: ["관련 교과목 1개 이상 수강", "프로젝트 결과물 제출", "교수 추천 선택"],
    icon: <Star className="h-12 w-12" />,
    iconClassName: "bg-blue-50 text-blue-400",
  },
  {
    id: "support",
    name: "학업지원 생활 장학금",
    amount: "100만원",
    period: "2026.07.15 ~ 2026.08.09",
    type: "생활지원",
    match: 84,
    summary: "학업 지속을 위한 생활비성 장학금입니다.",
    requirements: ["재학생", "소득분위 증빙", "학업계획서 제출"],
    icon: <Heart className="h-12 w-12" />,
    iconClassName: "bg-green-50 text-green-400",
  },
];

export default function ScholarshipsPage() {
  const userName = getCurrentUserName() || "사용자";
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(SCHOLARSHIPS[0]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return SCHOLARSHIPS;
    return SCHOLARSHIPS.filter((item) => [item.name, item.type, item.summary].some((value) => value.toLowerCase().includes(keyword)));
  }, [query]);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#F5F5FC] px-6 py-10 md:px-10 lg:px-14">
      <div className="pointer-events-none absolute -right-36 -top-40 h-[520px] w-[520px] rounded-full bg-[#E8E8FA] blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-48 -left-36 h-[520px] w-[520px] rounded-full bg-[#E8E8FA] blur-[90px]" />

      <div className="relative mx-auto grid max-w-[1500px] gap-10 xl:grid-cols-[1fr_460px]">
        <section>
          <header className="relative mb-10 min-h-[250px]">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#6B5DF6] shadow-sm">
              <Sparkles className="h-4 w-4" />
              AI 장학금 매칭
            </p>
            <h1 className="text-[42px] font-black leading-tight text-slate-900 md:text-[54px]" style={{ fontFamily: "PlanPickAggro", fontWeight: 900 }}>
              {userName}님을 위한
              <br />
              <span className="text-[#6B5DF6]">장학금 추천</span>
            </h1>
            <p className="mt-4 max-w-[760px] text-lg font-bold leading-relaxed text-slate-400">
              학업 정보와 활동 조건을 바탕으로 신청 가능한 장학금을 정리했어요.
            </p>
            <img
              src={`${import.meta.env.BASE_URL}scholarship-cap.png`}
              alt="학사모 일러스트"
              className="absolute right-0 top-0 hidden w-[280px] object-contain drop-shadow-xl md:block"
            />
          </header>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-950">추천 장학금</h2>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#6B5DF6] shadow-sm">{filtered.length}개 추천</span>
          </div>

          <div className="flex flex-col gap-5">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className={`flex w-full items-center gap-7 rounded-3xl bg-white p-7 text-left shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] ring-1 ring-white/60 transition-all hover:-translate-y-0.5 ${
                  selected.id === item.id ? "ring-2 ring-[#6B5DF6]" : ""
                }`}
              >
                <div className={`flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-2xl ${item.iconClassName}`}>{item.icon}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[22px] font-black text-slate-950">{item.name}</h3>
                  <p className="mt-2 text-base font-bold leading-relaxed text-slate-400">{item.summary}</p>
                </div>
                <div className="hidden text-right md:block">
                  <p className="text-2xl font-black text-[#6B5DF6]">{item.match}%</p>
                  <p className="mt-1 text-xs font-black text-slate-300">매칭률</p>
                </div>
              </button>
            ))}
          </div>

          <button type="button" className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-4 text-sm font-black text-slate-400 hover:bg-slate-200">
            더 많은 장학금 보기
            <ChevronDown className="h-4 w-4" />
          </button>
        </section>

        <aside className="space-y-6 pt-2">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
            <Search className="h-5 w-5 text-slate-300" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="검색하기"
              className="w-full bg-transparent text-base font-bold text-slate-700 outline-none placeholder:text-slate-300"
            />
          </div>

          <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#8C84FF] to-[#6B66FF] p-8 text-white shadow-[0_18px_35px_rgba(91,63,232,0.24)]">
            <div className="relative z-10 mb-6 flex items-start justify-between">
              <CheckCircle className="h-10 w-10 text-white/80" />
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-black backdrop-blur">매칭률 {selected.match}%</span>
            </div>
            <div className="relative z-10 mb-8">
              <h2 className="text-[28px] font-black leading-tight">{selected.name}</h2>
              <p className="mt-3 text-base font-bold leading-relaxed text-white/75">{selected.summary}</p>
            </div>
            <div className="relative z-10 grid gap-4 md:grid-cols-2">
              <InfoPill icon={<WalletCards className="h-4 w-4" />} label="지원금" value={selected.amount} />
              <InfoPill icon={<CalendarDays className="h-4 w-4" />} label="신청기간" value={selected.period} />
            </div>
            <div className="relative z-10 mt-6 text-right">
              <button type="button" className="text-sm font-black text-white/80 hover:text-white">
                자세히 보기 &gt;
              </button>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-7 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
            <h3 className="mb-5 flex items-center gap-3 text-xl font-black text-slate-950">
              <CheckCircle className="h-7 w-7 text-[#6B5DF6]" />
              신청 조건
            </h3>
            <div className="mb-7 flex flex-col gap-4">
              {selected.requirements.map((requirement) => (
                <p key={requirement} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-600">
                  <CheckCircle className="h-5 w-5 shrink-0 text-[#6B5DF6]" />
                  {requirement}
                </p>
              ))}
            </div>
            <button type="button" className="w-full rounded-2xl bg-[#6B5DF6] px-5 py-4 text-sm font-black text-white shadow-sm">
              신청 준비하기
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
      <p className="mb-1 flex items-center gap-2 text-sm font-black text-white/70">
        {icon}
        {label}
      </p>
      <p className="text-base font-black text-white">{value}</p>
    </div>
  );
}
