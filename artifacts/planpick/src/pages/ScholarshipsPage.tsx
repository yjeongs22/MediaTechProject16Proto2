import React, { useMemo, useState } from "react";
import { Award, CalendarDays, CheckCircle, ChevronRight, GraduationCap, Search, Sparkles, WalletCards } from "lucide-react";
import { getCurrentUserName } from "@/lib/auth";

type Scholarship = {
  id: string;
  name: string;
  amount: string;
  period: string;
  type: string;
  match: number;
  tags: string[];
  summary: string;
  requirements: string[];
};

const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "future-talent",
    name: "미래인재 성장 장학금",
    amount: "최대 200만원",
    period: "2026.07.01 - 2026.07.24",
    type: "성적/역량",
    match: 96,
    tags: ["전공역량", "성적우수", "포트폴리오"],
    summary: "전공 프로젝트와 학업 성취를 함께 평가하는 장학금입니다.",
    requirements: ["직전 학기 12학점 이상 이수", "평점 3.5 이상", "전공 활동 증빙 제출"],
  },
  {
    id: "media-tech",
    name: "미디어테크 실무 장학금",
    amount: "150만원",
    period: "2026.07.10 - 2026.08.02",
    type: "전공특화",
    match: 91,
    tags: ["미디어", "AI", "캡스톤"],
    summary: "AI, UX, 실감미디어 분야 활동 경험이 있는 학생에게 적합합니다.",
    requirements: ["관련 교과목 1개 이상 수강", "프로젝트 결과물 제출", "교수 추천 선택"],
  },
  {
    id: "support",
    name: "학업지원 생활 장학금",
    amount: "100만원",
    period: "2026.07.15 - 2026.08.09",
    type: "생활지원",
    match: 84,
    tags: ["생활비", "소득분위", "재학생"],
    summary: "학업 지속을 위한 생활비성 장학금입니다.",
    requirements: ["재학생", "소득분위 증빙", "학업계획서 제출"],
  },
];

export default function ScholarshipsPage() {
  const userName = getCurrentUserName() || "사용자";
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(SCHOLARSHIPS[0]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return SCHOLARSHIPS;
    return SCHOLARSHIPS.filter((item) => [item.name, item.type, item.summary, ...item.tags].some((value) => value.toLowerCase().includes(keyword)));
  }, [query]);

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#6B5DF6] shadow-sm">
              <Sparkles className="h-4 w-4" />
              AI 장학금 매칭
            </p>
            <h1 className="text-[34px] font-black text-slate-950 md:text-[42px]" style={{ fontFamily: "PlanPickAggro", fontWeight: 900 }}>
              {userName}님을 위한 장학금 추천
            </h1>
            <p className="mt-2 text-base font-bold text-slate-400">학업 정보와 활동 조건을 바탕으로 신청 가능한 장학금을 정리했어요.</p>
          </div>
          <div className="flex min-w-[260px] items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
            <Search className="h-5 w-5 text-slate-300" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="장학금 검색" className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-300" />
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950">추천 장학금</h2>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600">{filtered.length}개 추천</span>
            </div>
            <div className="space-y-3">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`grid w-full grid-cols-[1fr_auto] gap-4 rounded-2xl p-4 text-left transition-all ${
                    selected.id === item.id ? "bg-[#F3F0FF] ring-2 ring-[#6B5DF6]" : "bg-[#FAFAFF] ring-1 ring-slate-100 hover:bg-[#F6F4FF]"
                  }`}
                >
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-slate-950">{item.name}</h3>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#6B5DF6]">{item.type}</span>
                    </div>
                    <p className="text-sm font-bold leading-relaxed text-slate-500">{item.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="text-xl font-black text-[#6B5DF6]">{item.match}%</span>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <section className="rounded-3xl bg-gradient-to-br from-[#6B5DF6] to-[#4F35D7] p-6 text-white shadow-[0_16px_35px_rgba(91,63,232,0.22)]">
              <div className="mb-5 flex items-center justify-between">
                <Award className="h-9 w-9" />
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black">매칭률 {selected.match}%</span>
              </div>
              <h2 className="text-2xl font-black">{selected.name}</h2>
              <p className="mt-2 text-sm font-bold leading-relaxed text-white/75">{selected.summary}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <InfoPill icon={<WalletCards className="h-4 w-4" />} label="지원금" value={selected.amount} />
                <InfoPill icon={<CalendarDays className="h-4 w-4" />} label="신청기간" value={selected.period} />
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">
                <GraduationCap className="h-5 w-5 text-[#6B5DF6]" />
                신청 조건
              </h3>
              <div className="space-y-3">
                {selected.requirements.map((requirement) => (
                  <p key={requirement} className="flex items-start gap-2 rounded-2xl bg-[#FAFAFF] px-4 py-3 text-sm font-bold text-slate-600">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#6B5DF6]" />
                    {requirement}
                  </p>
                ))}
              </div>
              <button type="button" className="mt-5 w-full rounded-2xl bg-[#5B3FE8] px-5 py-3 text-sm font-black text-white shadow-sm">
                신청 준비하기
              </button>
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-3">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-black text-white/70">
        {icon}
        {label}
      </p>
      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}
