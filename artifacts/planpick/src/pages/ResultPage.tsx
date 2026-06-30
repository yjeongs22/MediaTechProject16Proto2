import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BookOpen, Calendar, Download, ExternalLink, RotateCcw, Sparkles } from "lucide-react";
import { getCourses, type Course } from "@/lib/courses";
import { getCurrentRequestId, getRequestById, type PlanData, type PlanpickRequest } from "@/lib/storage";
import { getCurrentUserName } from "@/lib/auth";

const PLAN_TABS = [
  { key: "plan1" as const, label: "졸업 안정형" },
  { key: "plan2" as const, label: "생활 균형형" },
  { key: "plan3" as const, label: "학점 방어형" },
];

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="truncate text-base font-black text-slate-900">{course.name}</h3>
        <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-black text-indigo-600">{course.credit}학점</span>
      </div>
      <p className="text-sm font-bold text-slate-500">
        {course.day} {course.start}~{course.end}
      </p>
      <p className="mt-1 text-xs font-bold text-slate-400">{course.room}</p>
    </div>
  );
}

function PlanSummary({ plan, courses }: { plan: PlanData; courses: Course[] }) {
  const scheduled = courses.filter((course) => plan.courseIds.includes(course.id));
  const totalCredits = scheduled.reduce((sum, course) => sum + course.credit, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-indigo-500">AI 추천 시간표</p>
            <h2 className="text-2xl font-black text-slate-900">{plan.label || "추천 플랜"}</h2>
          </div>
          <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-right">
            <p className="text-xs font-black text-indigo-400">총 학점</p>
            <p className="text-xl font-black text-indigo-600">{totalCredits}학점</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {scheduled.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
          {scheduled.length === 0 && <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-400">추천 과목이 아직 없습니다.</p>}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-[0_12px_30px_rgba(85,56,242,0.22)]">
          <p className="mb-2 text-sm font-black text-indigo-100">AI 추천 이유</p>
          <p className="text-sm font-bold leading-relaxed text-white/90">{plan.pros || "졸업요건과 선호 조건을 기준으로 추천했어요."}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
          <p className="mb-2 text-sm font-black text-slate-900">주의사항</p>
          <p className="text-sm font-bold leading-relaxed text-slate-500">{plan.cons || "수강신청 전 실제 개설 여부를 다시 확인해 주세요."}</p>
        </div>
      </aside>
    </div>
  );
}

export default function ResultPage() {
  const [, setLocation] = useLocation();
  const [request, setRequest] = useState<PlanpickRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof PLAN_TABS)[number]["key"]>("plan1");
  const courses = getCourses();
  const userName = getCurrentUserName() || "사용자";

  useEffect(() => {
    async function load() {
      const id = getCurrentRequestId();
      if (!id) {
        setLoading(false);
        return;
      }
      setRequest(await getRequestById(id));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#F4F2FF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const plan = request?.result?.[activeTab];

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
        <section className="rounded-[28px] bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-7 text-white shadow-[0_18px_40px_rgba(85,56,242,0.24)]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-black text-indigo-100">
                <Sparkles className="h-4 w-4" />
                PlanPick AI
              </p>
              <h1 className="text-3xl font-black md:text-4xl">{userName}님을 위한 시간표 추천 완료했습니다!</h1>
              <p className="mt-3 text-sm font-bold text-indigo-100">졸업요건과 선호 조건을 바탕으로 추천 결과를 정리했어요.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.open("https://time.navyism.com/?host=www.konkuk.ac.kr", "_blank")}
                className="flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Calendar className="h-4 w-4" />
                서버시간
                <ExternalLink className="h-3 w-3 opacity-70" />
              </button>
              <button
                onClick={() => window.open("https://sugang.konkuk.ac.kr/", "_blank")}
                className="rounded-xl bg-white px-4 py-2 text-sm font-black text-indigo-600 shadow-md transition-colors hover:bg-indigo-50"
              >
                수강신청
              </button>
            </div>
          </div>
        </section>

        {!request?.result || !plan ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <h2 className="mb-2 text-xl font-black text-slate-800">아직 추천 결과가 없습니다</h2>
            <p className="mb-6 text-sm font-bold text-slate-500">기본 정보와 원하는 조건을 먼저 입력해 주세요.</p>
            <button onClick={() => setLocation("/request")} className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white">
              추천 요청하기
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 overflow-hidden rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
              {PLAN_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-xl py-3 text-sm font-black transition-colors ${activeTab === tab.key ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-indigo-50"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <PlanSummary plan={plan} courses={courses} />

            <div className="flex items-center justify-between pb-2">
              <button
                onClick={() => setLocation("/request")}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                다시 추천받기
              </button>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
                  <Download className="h-4 w-4" />
                  PDF 저장
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:from-indigo-700 hover:to-violet-700">
                  <BookOpen className="h-4 w-4" />
                  시간표 적용하기
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
