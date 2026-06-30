import React, { useEffect, useState } from "react";
import { ArrowUpRight, Award, BriefcaseBusiness, CalendarDays, GraduationCap, Link as LinkIcon, Sparkles } from "lucide-react";
import { getContests, type ContestInfo } from "@/lib/contests";

const careerItems = [
  { icon: BriefcaseBusiness, title: "채용 정보", text: "AI 서비스 기획 인턴, 데이터 분석 인턴, 프론트엔드 인턴" },
  { icon: GraduationCap, title: "자격증 정보", text: "ADsP, SQLD, 정보처리기사, 컴퓨터활용능력" },
  { icon: Award, title: "추천 준비물", text: "포트폴리오 1장, GitHub 링크, 팀 역할 정리" },
];

export default function ContestsPage() {
  const [contests, setContests] = useState<ContestInfo[]>([]);
  const [selected, setSelected] = useState<ContestInfo | null>(null);

  useEffect(() => {
    getContests().then((items) => {
      setContests(items);
      setSelected(items[0] ?? null);
    });
  }, []);

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-7">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-black text-[#6B5DF6]">
            <Sparkles className="h-4 w-4" />
            AI 맞춤 비교
          </p>
          <h1 className="text-[36px] font-black text-slate-950 md:text-[44px]">공모전 바로가기</h1>
          <p className="mt-3 max-w-2xl text-base font-bold text-slate-500">
            PlanPick이 학생 활동과 진로 준비에 어울리는 공모전, 채용, 자격증 정보를 한 번에 보여줍니다.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {contests.map((contest, index) => (
            <button
              type="button"
              key={contest.id}
              onClick={() => setSelected(contest)}
              className="overflow-hidden rounded-3xl bg-white text-left shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100 transition-transform hover:-translate-y-1"
            >
              <div className="relative h-64 bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                {contest.poster ? (
                  <img src={contest.poster} alt={`${contest.name} 포스터`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center text-2xl font-black">
                    {contest.name || "공모전 포스터"}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute right-5 top-5 rounded-full bg-white/20 px-3 py-1 text-xs font-black">
                  PICK {index + 1}
                </div>
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
                    포스터를 admin에서 넣어주세요
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
                  {selected.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm font-black text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <span className="flex items-center gap-2">
                        <LinkIcon className="h-3.5 w-3.5" />
                        {link.label}
                      </span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">진로 정보 미리보기</h2>
              <p className="mt-1 text-sm font-bold text-slate-400">공지사항 카드처럼 가볍게 훑어보는 정보 영역입니다.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {careerItems.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Icon className="mb-3 h-6 w-6 text-indigo-500" />
                <h3 className="mb-2 text-base font-black text-slate-800">{title}</h3>
                <p className="text-sm font-bold leading-relaxed text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
