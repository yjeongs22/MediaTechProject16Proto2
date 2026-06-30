import React from "react";
import { ArrowUpRight, Award, BriefcaseBusiness, CalendarDays, GraduationCap, Link as LinkIcon, Sparkles } from "lucide-react";

const contests = [
  {
    name: "대학생 AI 서비스 기획 공모전",
    date: "2026.07.01 - 2026.08.12",
    reason: "PlanPick 전공/시간표 데이터와 연결해 AI 추천 서비스 아이디어를 확장하기 좋아요.",
    tone: "from-indigo-500 to-violet-500",
    links: [
      { label: "공모전 보기", href: "https://www.wevity.com/" },
      { label: "아이디어 참고", href: "https://www.thinkcontest.com/" },
      { label: "지원 준비", href: "https://www.all-con.co.kr/" },
    ],
  },
  {
    name: "공공데이터 활용 창업 경진대회",
    date: "2026.07.15 - 2026.09.02",
    reason: "학교·지역·채용 데이터를 묶어 학생 맞춤 추천 서비스로 발전시키기 좋아요.",
    tone: "from-sky-500 to-cyan-400",
    links: [
      { label: "공공데이터", href: "https://www.data.go.kr/" },
      { label: "공모전 검색", href: "https://www.wevity.com/" },
      { label: "팀 빌딩", href: "https://www.thinkcontest.com/" },
    ],
  },
  {
    name: "청년 진로 포트폴리오 챌린지",
    date: "2026.08.01 - 2026.09.20",
    reason: "수강 계획, 자격증, 채용 정보를 한 화면에 모으는 PlanPick 방향성과 잘 맞아요.",
    tone: "from-fuchsia-500 to-pink-400",
    links: [
      { label: "공모전 모음", href: "https://www.all-con.co.kr/" },
      { label: "포스터 보기", href: "https://www.wevity.com/" },
      { label: "신청 가이드", href: "https://www.thinkcontest.com/" },
    ],
  },
];

const careerItems = [
  { icon: BriefcaseBusiness, title: "채용 정보", text: "AI 서비스 기획 인턴, 데이터 분석 인턴, 프론트엔드 인턴" },
  { icon: GraduationCap, title: "자격증 정보", text: "ADsP, SQLD, 정보처리기사, 컴퓨터활용능력" },
  { icon: Award, title: "추천 준비물", text: "포트폴리오 1장, GitHub 링크, 팀 역할 정리" },
];

export default function ContestsPage() {
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
            <article key={contest.name} className="overflow-hidden rounded-3xl bg-white shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
              <div className={`relative h-48 bg-gradient-to-br ${contest.tone} p-5 text-white`}>
                <div className="absolute right-5 top-5 rounded-full bg-white/20 px-3 py-1 text-xs font-black">
                  PICK {index + 1}
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="mb-2 text-sm font-bold text-white/80">PlanPick Contest</p>
                  <h2 className="text-2xl font-black leading-tight">{contest.name}</h2>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-center gap-2 text-sm font-black text-slate-600">
                  <CalendarDays className="h-4 w-4 text-indigo-500" />
                  {contest.date}
                </div>
                <div className="rounded-2xl bg-indigo-50 p-4">
                  <p className="mb-1 text-xs font-black text-indigo-500">AI 추천 이유</p>
                  <p className="text-sm font-bold leading-relaxed text-slate-600">{contest.reason}</p>
                </div>
                <div className="grid gap-2">
                  {contest.links.map((link) => (
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
            </article>
          ))}
        </div>

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
