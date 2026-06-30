import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, ArrowLeft, BookOpen, Box, Calendar, CheckCircle, Download, ExternalLink, GraduationCap, RotateCcw, Sparkles, Star, ThumbsUp, Users } from "lucide-react";
import { getCourses, type Course } from "@/lib/courses";
import { getCurrentRequestId, getRequestById, type PlanData, type PlanpickRequest } from "@/lib/storage";
import { getCurrentUserName } from "@/lib/auth";

const DAYS = ["월", "화", "수", "목", "금"];
const HOURS = ["09", "10", "11", "12", "13", "14", "15", "16", "17"];
const PLAN_TABS = [
  { key: "plan1" as const, label: "졸업 안정형" },
  { key: "plan2" as const, label: "생활 균형형" },
  { key: "plan3" as const, label: "학점 방어형" },
  { key: "planB" as const, label: "Plan B" },
];

const COURSE_FALLBACK: Record<string, Partial<Course>> = {
  "data-structure": { name: "자료구조", type: "전공필수", day: "월", start: "10:00", end: "12:00", room: "공학관 302호", credit: 3, color: "#A78BFA" },
  "computer-arch": { name: "컴퓨터구조", type: "전공필수", day: "월", start: "14:00", end: "16:00", room: "공학관 405호", credit: 3, color: "#A78BFA" },
  "web-programming": { name: "웹프로그래밍", type: "전공선택", day: "수", start: "13:00", end: "15:00", room: "실습실 210호", credit: 3, color: "#C4B5FD" },
  database: { name: "데이터베이스", type: "전공선택", day: "화", start: "10:00", end: "12:00", room: "공학관 302호", credit: 3, color: "#8BE26B" },
  english: { name: "교양영어", type: "교양", day: "화", start: "16:00", end: "17:00", room: "교양관 103호", credit: 2, color: "#F9CDD0" },
  creative: { name: "창의적사고", type: "교양", day: "금", start: "13:00", end: "15:00", room: "교양관 205호", credit: 2, color: "#FDE68A" },
  "ai-basic": { name: "AI기초", type: "전공선택", day: "수", start: "09:00", end: "11:00", room: "AI융합관 301호", credit: 3, color: "#DDD6FE" },
};

function normalizeCourse(course: Course): Course {
  return { ...course, ...(COURSE_FALLBACK[course.id] || {}) } as Course;
}

function timeToRow(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour - 9 + (minute || 0) / 60;
}

function TimetableGrid({ courses }: { courses: Course[] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <h3 className="mb-4 border-l-4 border-[#9D91F7] pl-3 text-lg font-black text-slate-900">추천 시간표</h3>
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
        <div className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-slate-100 bg-white text-center text-sm font-black text-slate-900">
          <div />
          {DAYS.map((day) => (
            <div key={day} className="py-3">
              {day}
            </div>
          ))}
        </div>
        <div className="relative grid grid-cols-[70px_1fr]">
          <div>
            {HOURS.map((hour) => (
              <div key={hour} className="h-14 border-b border-slate-100 pr-3 pt-2 text-right text-sm font-bold text-slate-500">
                {hour}:00
              </div>
            ))}
          </div>
          <div className="relative grid grid-cols-5">
            {DAYS.map((day) => (
              <div key={day} className="relative border-l border-slate-100">
                {HOURS.map((hour) => (
                  <div key={hour} className="h-14 border-b border-slate-100" />
                ))}
              </div>
            ))}
            {courses.map((course, index) => {
              const dayIndex = DAYS.indexOf(course.day);
              if (dayIndex < 0) return null;
              const top = timeToRow(course.start) * 56;
              const height = Math.max(42, (timeToRow(course.end) - timeToRow(course.start)) * 56 - 4);
              return (
                <div
                  key={`${course.id}-${index}`}
                  className="absolute rounded-xl border border-black/5 p-2 text-xs font-black text-slate-700 shadow-sm"
                  style={{
                    left: `calc(${dayIndex * 20}% + 8px)`,
                    width: "calc(20% - 16px)",
                    top,
                    height,
                    backgroundColor: course.color || "#DDD6FE",
                  }}
                >
                  {course.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseList({ courses }: { courses: Course[] }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="border-l-4 border-[#9D91F7] pl-3 text-lg font-black text-slate-900">추천 과목 목록</h3>
        <button className="flex items-center gap-1 text-sm font-black text-slate-400">
          전체보기 <ExternalLink className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3">
        {courses.map((course) => (
          <div key={course.id} className="grid grid-cols-[8px_1fr_auto_auto] items-center gap-3">
            <span className="h-11 rounded-full" style={{ backgroundColor: course.color || "#9D91F7" }} />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-900">{course.name}</h4>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-500">{course.type}</span>
              </div>
              <p className="text-xs font-bold text-slate-400">
                {course.start}~{course.end} ㅣ {course.day} ㅣ {course.room}
              </p>
            </div>
            <div className="hidden text-amber-400 md:block">
              {"★★★★★".split("").map((star, index) => (
                <Star key={index} className="inline h-4 w-4 fill-current" />
              ))}
            </div>
            <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700">강의정보</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ResultPage() {
  const [, setLocation] = useLocation();
  const [request, setRequest] = useState<PlanpickRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof PLAN_TABS)[number]["key"]>("plan1");
  const userName = getCurrentUserName() || "사용자";
  const allCourses = useMemo(() => getCourses().map(normalizeCourse), []);

  useEffect(() => {
    async function load() {
      const id = getCurrentRequestId();
      if (id) setRequest(await getRequestById(id));
      setLoading(false);
    }
    load();
  }, []);

  const result = request?.result;
  const activePlan = activeTab !== "planB" ? result?.[activeTab] : null;
  const selectedCourses = useMemo(() => {
    const ids = activePlan?.courseIds?.length ? activePlan.courseIds : ["data-structure", "database", "computer-arch", "web-programming", "english", "creative", "ai-basic"];
    return ids.map((id) => allCourses.find((course) => course.id === id) || ({ id, ...COURSE_FALLBACK[id] } as Course)).filter(Boolean).map(normalizeCourse);
  }, [activePlan, allCourses]);

  const totalCredits = selectedCourses.reduce((sum, course) => sum + (course.credit || 0), 0);
  const courseTypes = new Set(selectedCourses.map((course) => course.type)).size;
  const keywords = result?.priorities?.length ? result.priorities : ["공강선호", "졸업우선", "전공필수", "오전수업최소", `${totalCredits}학점`];

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#F4F2FF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#F4F2FF] px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
          <h2 className="mb-2 text-xl font-black text-slate-900">아직 추천 결과가 없습니다</h2>
          <p className="mb-6 text-sm font-bold text-slate-500">관리자 승인 후 결과가 표시됩니다.</p>
          <button onClick={() => setLocation("/request")} className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white">
            다시 요청하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-6 md:px-10 lg:px-14">
      <div className="mx-auto grid max-w-[1180px] gap-5 xl:grid-cols-[1fr_470px]">
        <div className="xl:col-span-2 flex items-center justify-between">
          <div>
            <button onClick={() => setLocation("/")} className="mb-3 flex items-center gap-2 text-lg font-black text-[#6B5DF6]">
              <ArrowLeft className="h-5 w-5" />
              대시보드
            </button>
            <h1 className="text-4xl font-black text-slate-950">{userName}님을 위한 시간표 추천 완료했습니다!</h1>
            <p className="mt-2 text-lg font-black text-[#6B5DF6]">AI가 졸업요건과 선호도를 분석하여 추천한 결과입니다.</p>
          </div>
          <div className="hidden gap-3 md:flex">
            <button onClick={() => window.open("https://time.navyism.com/?host=www.konkuk.ac.kr", "_blank")} className="rounded-2xl bg-white px-7 py-4 text-lg font-black text-slate-900 shadow-sm">
              서비스시간
            </button>
            <button onClick={() => window.open("https://sugang.konkuk.ac.kr/", "_blank")} className="rounded-2xl bg-[#5B3FE8] px-7 py-4 text-lg font-black text-white shadow-lg">
              수강신청
            </button>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
          <div className="flex items-center gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-[#6B5DF6]">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900">AI 분석 요약</h2>
          </div>
          <div className="mt-6 grid grid-cols-4 items-center gap-4">
            {[
              { icon: Box, label: "추천 과목", value: `${selectedCourses.length}개` },
              { icon: GraduationCap, label: "총 학점", value: `${totalCredits}학점` },
              { icon: Users, label: "과목 종류", value: `${courseTypes}개` },
              { icon: CheckCircle, label: "Plan B 포함", value: result.planB ? "포함" : "미포함" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-[#6B5DF6]">
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-700">{label}</p>
                  <p className="text-xl font-black text-slate-950">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
          <h2 className="mb-5 border-l-4 border-[#9D91F7] pl-3 text-xl font-black text-slate-900">반영된 키워드</h2>
          <div className="flex flex-wrap gap-3">
            {keywords.map((keyword) => (
              <span key={keyword} className="rounded-full bg-[#F1EEFF] px-4 py-3 text-sm font-black text-[#6B5DF6]">
                # {keyword}
              </span>
            ))}
          </div>
        </section>

        <div className="xl:col-span-2 grid grid-cols-4 gap-3">
          {PLAN_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl px-4 py-4 text-lg font-black shadow-sm transition-colors ${
                activeTab === tab.key ? "bg-[#5B3FE8] text-white" : "bg-white text-slate-900 hover:bg-indigo-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "planB" ? (
          <section className="xl:col-span-2 rounded-3xl bg-white p-8 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <h2 className="mb-4 text-2xl font-black text-slate-900">Plan B</h2>
            <p className="text-lg font-bold leading-relaxed text-slate-600">{result.planB || "대체 시간표는 아직 등록되지 않았습니다."}</p>
          </section>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
              <aside className="space-y-4">
                <section className="rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
                  <h3 className="mb-5 flex items-center gap-3 text-xl font-black text-slate-900">
                    <ThumbsUp className="h-6 w-6 text-green-500" />
                    장점
                  </h3>
                  <ul className="space-y-3 text-base font-bold text-slate-500">
                    {(activePlan?.pros || "전공필수 포함, 졸업요건 충족, 이동거리 최소").split(/[,\n]/).map((item) => (
                      <li key={item}>• {item.trim()}</li>
                    ))}
                  </ul>
                </section>
                <section className="rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
                  <h3 className="mb-5 flex items-center gap-3 text-xl font-black text-slate-900">
                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                    주의사항
                  </h3>
                  <ul className="space-y-3 text-base font-bold text-slate-500">
                    {(activePlan?.cons || "수요일 오전 수업 존재, 금요일 공강 불가").split(/[,\n]/).map((item) => (
                      <li key={item}>• {item.trim()}</li>
                    ))}
                  </ul>
                </section>
              </aside>
              <TimetableGrid courses={selectedCourses} />
            </div>

            <div className="space-y-4">
              <CourseList courses={selectedCourses} />
              <section className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
                <h3 className="mb-5 border-l-4 border-[#6B5DF6] pl-3 text-xl font-black text-slate-900">AI 추천 이유</h3>
                <ul className="space-y-2 text-sm font-black text-slate-700">
                  {["졸업요건을 가장 많이 충족합니다.", "공강을 최대한 확보하였습니다.", "이동시간이 적어 효율적입니다.", "선호 교수님과 시간이 반영되었습니다.", "선호도와 졸업요건을 종합한 최적의 시간표입니다."].map((reason) => (
                    <li key={reason} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#6B5DF6]" />
                      {reason}
                    </li>
                  ))}
                </ul>
                <img src={`${import.meta.env.BASE_URL}robot.png`} alt="AI 로봇" className="absolute bottom-0 right-8 h-36 w-36 object-contain" />
              </section>
            </div>
          </>
        )}

        <div className="xl:col-span-2 flex justify-center gap-3 pb-4">
          <button onClick={() => setLocation("/request")} className="flex min-w-60 items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-black text-slate-900 shadow-sm">
            <RotateCcw className="h-5 w-5" />
            다시 추천받기
          </button>
          <button className="flex min-w-60 items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-black text-slate-900 shadow-sm">
            <Download className="h-5 w-5" />
            PDF 저장
          </button>
          <button className="flex min-w-60 items-center justify-center rounded-2xl bg-[#5B3FE8] px-8 py-4 text-lg font-black text-white shadow-lg">
            시간표 적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
