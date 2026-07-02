import React, { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Cloud, FilePenLine, Link as LinkIcon, Megaphone, Sparkles, UserRound } from "lucide-react";
import { getCurrentUserName } from "@/lib/auth";
import { getContests, type ContestInfo } from "@/lib/contests";

const jobTabs = ["전체", "추천 채용정보", "잡코리아 채용정보", "학교입력 채용정보"];

const jobItems = [
  {
    icon: Megaphone,
    iconClassName: "bg-blue-50 text-blue-600",
    badgeClassName: "border-blue-500 text-blue-600",
    title: "[에코마케팅] 클라우드 인프라 엔지니어 신입/경력 채용",
    company: "에코마케팅",
    meta: "정규직 | 서울 | 기타 사무원",
    due: "D-12",
    dueClassName: "text-blue-700",
  },
  {
    icon: Cloud,
    iconClassName: "bg-blue-50 text-blue-600",
    badgeClassName: "border-blue-500 text-blue-600",
    title: "[파수 AI] 26년 2차 신입공채",
    company: "파수 AI",
    meta: "인턴 | 서울 | 기타 사무원",
    due: "D-12",
    dueClassName: "text-blue-700",
  },
  {
    icon: FilePenLine,
    iconClassName: "bg-red-50 text-red-500",
    badgeClassName: "border-red-500 text-red-500",
    title: "[고려아연] 2026 고려아연 및 계열사 신입사원 채용",
    company: "고려아연",
    meta: "정규직 | 서울 | 기타 사무원",
    due: "D-03",
    dueClassName: "text-red-500",
    date: "2026.06.30",
  },
];

export default function ContestsPage() {
  const [contests, setContests] = useState<ContestInfo[]>([]);
  const [selected, setSelected] = useState<ContestInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const userName = getCurrentUserName() || "사용자";

  useEffect(() => {
    let alive = true;

    getContests()
      .then((items) => {
        if (!alive) return;
        setContests(items);
        setSelected(items[0] ?? null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-7">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-black text-[#6B5DF6]">
            <Sparkles className="h-4 w-4" />
            AI 맞춤 비교
          </p>
          <h1 className="text-[34px] font-black text-slate-950 md:text-[42px]" style={{ fontFamily: "PlanPickAggro", fontWeight: 900 }}>
            {userName}님을 위한 공모전 추천 완료했습니다!
          </h1>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-8 text-center text-lg font-black text-indigo-500 shadow-[0_12px_30px_rgba(48,43,99,0.08)]">
            공모전 정보를 불러오는 중입니다...
          </div>
        )}

        {!loading && contests.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-lg font-black text-slate-500 shadow-[0_12px_30px_rgba(48,43,99,0.08)]">
            아직 등록된 공모전이 없습니다.
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          {contests.map((contest, index) => (
            <button
              type="button"
              key={contest.id}
              onClick={() => setSelected(contest)}
              className={`overflow-hidden rounded-3xl bg-white text-left shadow-[0_12px_30px_rgba(48,43,99,0.08)] transition-transform hover:-translate-y-1 ${
                selected?.id === contest.id ? "ring-2 ring-[#6B5DF6]" : "ring-1 ring-slate-100"
              }`}
            >
              <div className="relative h-72 bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                {contest.poster ? (
                  <img src={contest.poster} alt={`${contest.name} 포스터`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center text-2xl font-black">
                    {contest.name || "공모전 포스터"}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute right-5 top-5 rounded-full bg-white/20 px-3 py-1 text-xs font-black">PICK {index + 1}</div>
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="mb-2 text-sm font-bold text-white/80">PlanPick Contest</p>
                  <h2 className="text-2xl font-black leading-tight">{contest.name}</h2>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <div className="overflow-hidden rounded-2xl bg-indigo-50">
                {selected.poster ? (
                  <img src={selected.poster} alt={`${selected.name} 포스터`} className="h-full min-h-[360px] w-full object-cover" />
                ) : (
                  <div className="flex min-h-[360px] items-center justify-center p-8 text-center text-2xl font-black text-indigo-500">
                    포스터가 아직 등록되지 않았어요
                  </div>
                )}
              </div>
              <div className="space-y-4 p-5">
                <h2 className="text-3xl font-black text-slate-900">{selected.name}</h2>
                <div className="flex items-center gap-2 text-sm font-black text-slate-600">
                  <CalendarDays className="h-4 w-4 text-indigo-500" />
                  {selected.date}
                </div>
                <div className="rounded-2xl bg-indigo-50 p-4">
                  <p className="mb-1 text-xs font-black text-indigo-500">AI 추천 이유</p>
                  <p className="text-sm font-bold leading-relaxed text-slate-600">{selected.reason}</p>
                </div>
                <div className="grid gap-2">
                  {selected.links.length > 0 ? (
                    selected.links.map((link, index) => (
                      <a
                        key={`${link.label}-${index}`}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm font-black text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <span className="flex items-center gap-2">
                          <LinkIcon className="h-3.5 w-3.5" />
                          {link.label || `링크 ${index + 1}`}
                        </span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ))
                  ) : (
                    <p className="rounded-xl border border-slate-100 px-3 py-2 text-sm font-black text-slate-400">
                      링크가 아직 등록되지 않았어요.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
          <div className="flex flex-wrap items-center gap-5 border-b-2 border-blue-600 pb-5">
            <h2 className="mr-auto text-[34px] font-black text-slate-950 md:text-[42px]" style={{ fontFamily: "PlanPickAggro", fontWeight: 900 }}>
              채용정보
            </h2>
            <button type="button" className="rounded-2xl bg-blue-700 px-8 py-4 text-lg font-black text-white shadow-[0_12px_24px_rgba(29,78,216,0.22)]">
              더보기
            </button>
            <div className="flex flex-wrap items-center gap-7 text-base font-black text-slate-950 md:text-lg">
              {jobTabs.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`border-b-2 px-1 pb-2 ${index === 0 ? "border-blue-700 text-blue-700" : "border-transparent text-slate-950"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {jobItems.map(({ icon: Icon, iconClassName, badgeClassName, title, company, meta, due, dueClassName, date }) => (
              <button key={title} type="button" className="grid w-full gap-5 py-7 text-left md:grid-cols-[140px_1fr_auto] md:items-center">
                <div className={`flex h-28 w-28 items-center justify-center rounded-3xl ${iconClassName}`}>
                  <Icon className="h-14 w-14 stroke-[1.8]" />
                </div>
                <div>
                  <span className={`mb-3 inline-flex rounded-lg border px-4 py-1 text-sm font-black ${badgeClassName}`}>&lt;학교&gt;</span>
                  <h3 className="text-2xl font-black leading-tight text-slate-950 underline decoration-slate-950 underline-offset-4">{title}</h3>
                  <p className="mt-3 text-base font-bold text-slate-400">
                    {company} <span className="mx-2 text-slate-300">|</span> {meta}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-6 text-base font-black text-slate-950">
                    <span className="inline-flex items-center gap-2">
                      <UserRound className="h-5 w-5" />
                      채용인원 <strong className="text-emerald-500">00</strong> 명
                    </span>
                    <span className="hidden h-6 w-px bg-slate-300 md:inline-block" />
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      마감일 <strong className={dueClassName}>{due}</strong>
                    </span>
                  </div>
                </div>
                {date && <time className="self-end text-right text-lg font-bold text-slate-700 md:self-auto">{date}</time>}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
