import React, { useMemo, useState } from "react";
import { BadgeCheck, CalendarDays, CheckCircle, ChevronRight, FileText, Search, Sparkles, Star, Timer, Trophy } from "lucide-react";
import { getCurrentUserName } from "@/lib/auth";

type Certification = {
  id: string;
  name: string;
  field: string;
  level: string;
  date: string;
  match: number;
  tags: string[];
  summary: string;
  plan: string[];
};

const CERTIFICATIONS: Certification[] = [
  {
    id: "sqld",
    name: "SQLD",
    field: "데이터베이스",
    level: "입문-중급",
    date: "상시/정기 접수",
    match: 97,
    tags: ["데이터베이스", "백엔드", "취업가산"],
    summary: "데이터베이스 과목을 듣고 있다면 가장 먼저 준비하기 좋은 실무형 자격증입니다.",
    plan: ["SQL 기본 문법 정리", "기출 3회독", "정규화/조인/트랜잭션 집중"],
  },
  {
    id: "adsp",
    name: "ADsP",
    field: "데이터 분석",
    level: "입문",
    date: "2026년 하반기 예정",
    match: 92,
    tags: ["AI", "분석", "통계기초"],
    summary: "AI와 데이터 분석 역량을 보여주기 좋은 자격증입니다.",
    plan: ["데이터 이해 파트 암기", "분석 기획 흐름 정리", "통계 용어와 기출 중심 학습"],
  },
  {
    id: "engineer-info",
    name: "정보처리기사",
    field: "소프트웨어",
    level: "중급",
    date: "정기 기사 시험",
    match: 88,
    tags: ["개발", "전공필수", "공기업"],
    summary: "개발 직무와 공기업 준비를 함께 고려할 때 활용도가 높은 대표 자격증입니다.",
    plan: ["필기 과목별 개념 정리", "실기 코드/약술형 대비", "시험 3주 전 기출 집중"],
  },
  {
    id: "gtq",
    name: "GTQ 그래픽기술자격",
    field: "디자인",
    level: "입문",
    date: "매월 시행",
    match: 81,
    tags: ["디자인", "포트폴리오", "실습형"],
    summary: "UX/UI나 콘텐츠 제작 포트폴리오와 함께 보여주기 좋은 실습형 자격증입니다.",
    plan: ["툴 단축키 숙달", "기출 이미지 재현", "시간 제한 모의 연습"],
  },
];

export default function CertificationsPage() {
  const userName = getCurrentUserName() || "사용자";
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(CERTIFICATIONS[0]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return CERTIFICATIONS;
    return CERTIFICATIONS.filter((item) => [item.name, item.field, item.summary, ...item.tags].some((value) => value.toLowerCase().includes(keyword)));
  }, [query]);

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#6B5DF6] shadow-sm">
              <Sparkles className="h-4 w-4" />
              AI 자격증 로드맵
            </p>
            <h1 className="text-[34px] font-black text-slate-950 md:text-[42px]" style={{ fontFamily: "PlanPickAggro", fontWeight: 900 }}>
              {userName}님을 위한 자격증 추천
            </h1>
            <p className="mt-2 text-base font-bold text-slate-400">전공 과목, 진로 방향, 준비 난이도에 맞춰 추천 자격증을 정리했어요.</p>
          </div>
          <div className="flex min-w-[260px] items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
            <Search className="h-5 w-5 text-slate-300" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="자격증 검색" className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-300" />
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950">추천 자격증</h2>
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
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#6B5DF6]">{item.field}</span>
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
                <Trophy className="h-9 w-9" />
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black">추천도 {selected.match}%</span>
              </div>
              <h2 className="text-2xl font-black">{selected.name}</h2>
              <p className="mt-2 text-sm font-bold leading-relaxed text-white/75">{selected.summary}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <InfoPill icon={<BadgeCheck className="h-4 w-4" />} label="분야" value={selected.field} />
                <InfoPill icon={<Timer className="h-4 w-4" />} label="난이도" value={selected.level} />
                <InfoPill icon={<CalendarDays className="h-4 w-4" />} label="시험 일정" value={selected.date} />
                <InfoPill icon={<Star className="h-4 w-4" />} label="활용도" value="높음" />
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">
                <FileText className="h-5 w-5 text-[#6B5DF6]" />
                준비 로드맵
              </h3>
              <div className="space-y-3">
                {selected.plan.map((step, index) => (
                  <p key={step} className="flex items-start gap-3 rounded-2xl bg-[#FAFAFF] px-4 py-3 text-sm font-bold text-slate-600">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-[#6B5DF6]">{index + 1}</span>
                    {step}
                  </p>
                ))}
              </div>
              <button type="button" className="mt-5 w-full rounded-2xl bg-[#5B3FE8] px-5 py-3 text-sm font-black text-white shadow-sm">
                학습 계획 세우기
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
