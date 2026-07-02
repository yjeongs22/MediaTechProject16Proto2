import React, { useMemo, useState } from "react";
import { BadgeCheck, CalendarDays, CheckCircle, ChevronDown, Database, FileText, Palette, Search, ServerCog, Sparkles, Star, Timer, Trophy } from "lucide-react";
import { getCurrentUserName } from "@/lib/auth";

type Certification = {
  id: string;
  name: string;
  field: string;
  level: string;
  date: string;
  match: number;
  summary: string;
  plan: string[];
  link: string;
  icon: React.ReactNode;
  iconClassName: string;
};

const CERTIFICATIONS: Certification[] = [
  {
    id: "sqld",
    name: "SQLD",
    field: "데이터베이스",
    level: "입문-중급",
    date: "상시/정기 접수",
    match: 97,
    summary: "데이터베이스 과목을 듣고 있다면 가장 먼저 준비하기 좋은 실무형 자격증입니다.",
    plan: ["SQL 기본 문법 정리", "기출 3회독", "정규화와 조인 집중 복습"],
    link: "https://www.dataq.or.kr/www/main.do",
    icon: <Database className="h-12 w-12" />,
    iconClassName: "bg-indigo-50 text-indigo-400",
  },
  {
    id: "adsp",
    name: "ADsP",
    field: "데이터 분석",
    level: "입문",
    date: "2026년 하반기 예정",
    match: 92,
    summary: "AI와 데이터 분석 역량을 보여주기 좋은 자격증입니다.",
    plan: ["데이터 이해 파트 암기", "분석 기획 흐름 정리", "통계 용어와 기출 중심 학습"],
    link: "https://www.dataq.or.kr/www/main.do",
    icon: <ServerCog className="h-12 w-12" />,
    iconClassName: "bg-blue-50 text-blue-400",
  },
  {
    id: "engineer-info",
    name: "정보처리기사",
    field: "소프트웨어",
    level: "중급",
    date: "정기 기사 시험",
    match: 88,
    summary: "개발 직무와 공기업 준비를 함께 고려할 때 활용도가 높은 대표 자격증입니다.",
    plan: ["필기 과목별 개념 정리", "실기 코드/서술형 대비", "시험 3주 전 기출 집중"],
    link: "https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=1320",
    icon: <FileText className="h-12 w-12" />,
    iconClassName: "bg-green-50 text-green-400",
  },
  {
    id: "gtq",
    name: "GTQ 그래픽기술자격",
    field: "디자인",
    level: "입문",
    date: "매월 시행",
    match: 81,
    summary: "UX/UI와 콘텐츠 제작 포트폴리오를 함께 보여주기 좋은 실습형 자격증입니다.",
    plan: ["툴 단축키 익히기", "기출 이미지 재현", "시간 제한 모의 연습"],
    link: "https://license.kpc.or.kr/nasec/qlfint/qlfint/selectGtqinfomg.do",
    icon: <Palette className="h-12 w-12" />,
    iconClassName: "bg-pink-50 text-pink-400",
  },
];

export default function CertificationsPage() {
  const userName = getCurrentUserName() || "사용자";
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(CERTIFICATIONS[0]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return CERTIFICATIONS;
    return CERTIFICATIONS.filter((item) => [item.name, item.field, item.summary].some((value) => value.toLowerCase().includes(keyword)));
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
              AI 자격증 로드맵
            </p>
            <h1 className="text-[42px] font-black leading-tight text-slate-900 md:text-[54px]" style={{ fontFamily: "PlanPickAggro", fontWeight: 900 }}>
              {userName}님을 위한
              <br />
              <span className="text-[#6B5DF6]">자격증 추천</span>
            </h1>
            <p className="mt-4 max-w-[760px] text-lg font-bold leading-relaxed text-slate-400">
              전공 과목, 진로 방향, 준비 시기에 맞춰 추천 자격증을 정리했어요.
            </p>
            <img
              src={`${import.meta.env.BASE_URL}scholarship-cap.png`}
              alt="학사모 일러스트"
              className="absolute right-0 top-0 hidden w-[260px] object-contain drop-shadow-xl md:block"
            />
          </header>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-950">추천 자격증</h2>
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
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-[22px] font-black text-slate-950">{item.name}</h3>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-[#6B5DF6]">{item.field}</span>
                  </div>
                  <p className="text-base font-bold leading-relaxed text-slate-400">{item.summary}</p>
                </div>
                <div className="hidden text-right md:block">
                  <p className="text-2xl font-black text-[#6B5DF6]">{item.match}%</p>
                  <p className="mt-1 text-xs font-black text-slate-300">추천도</p>
                </div>
              </button>
            ))}
          </div>

          <button type="button" className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-4 text-sm font-black text-slate-400 hover:bg-slate-200">
            더 많은 자격증 보기
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
              <Trophy className="h-10 w-10 text-white/80" />
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-black backdrop-blur">추천도 {selected.match}%</span>
            </div>
            <div className="relative z-10 mb-8">
              <h2 className="text-[28px] font-black leading-tight">{selected.name}</h2>
              <p className="mt-3 text-base font-bold leading-relaxed text-white/75">{selected.summary}</p>
            </div>
            <div className="relative z-10 grid gap-4 md:grid-cols-2">
              <InfoPill icon={<BadgeCheck className="h-4 w-4" />} label="분야" value={selected.field} />
              <InfoPill icon={<Timer className="h-4 w-4" />} label="난이도" value={selected.level} />
              <InfoPill icon={<CalendarDays className="h-4 w-4" />} label="시험 일정" value={selected.date} />
              <InfoPill icon={<Star className="h-4 w-4" />} label="활용도" value="높음" />
            </div>
            <div className="relative z-10 mt-6 text-right">
              <a href={selected.link} target="_blank" rel="noreferrer" className="text-sm font-black text-white/80 hover:text-white">
                공식 페이지 이동 &gt;
              </a>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-7 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
            <h3 className="mb-5 flex items-center gap-3 text-xl font-black text-slate-950">
              <CheckCircle className="h-7 w-7 text-[#6B5DF6]" />
              준비 로드맵
            </h3>
            <div className="mb-7 flex flex-col gap-4">
              {selected.plan.map((step, index) => (
                <p key={step} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-600">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-[#6B5DF6]">{index + 1}</span>
                  {step}
                </p>
              ))}
            </div>
            <a href={selected.link} target="_blank" rel="noreferrer" className="block w-full rounded-2xl bg-[#6B5DF6] px-5 py-4 text-center text-sm font-black text-white shadow-sm">
              자격증 페이지로 이동
            </a>
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
