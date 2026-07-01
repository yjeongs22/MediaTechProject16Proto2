import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, ArrowLeft, Box, CheckCircle, Download, GraduationCap, RotateCcw, Sparkles, Star, ThumbsUp, Users, X } from "lucide-react";
import { getCoursesAsync, type Course } from "@/lib/courses";
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

type PlanKey = (typeof PLAN_TABS)[number]["key"];

function cleanDay(day: string) {
  const value = String(day || "").trim();
  const found = DAYS.find((item) => value.includes(item));
  return found || value.slice(0, 1);
}

function timeToRow(time: string) {
  const [hour, minute] = String(time || "09:00")
    .split(":")
    .map(Number);
  return Math.max(0, (hour || 9) - 9 + (minute || 0) / 60);
}

function getReviews(course: Course) {
  const base = course.review || "등록된 강의평이 없습니다.";
  return [
    base,
    "수업 흐름과 과제량을 미리 확인하고 들어가면 따라가기 좋습니다.",
    "출석, 과제, 시험 준비를 꾸준히 챙기는 학생에게 추천됩니다.",
  ];
}

function getSummary(course: Course) {
  if (course.difficulty === "높음") return "한 줄 요약: 난이도는 있지만 전공 이해도 향상에 도움이 되는 과목입니다.";
  if (course.team === "있음") return "한 줄 요약: 팀 활동이 있어 일정 관리가 중요한 과목입니다.";
  return "한 줄 요약: 시간표 균형을 해치지 않으면서 챙기기 좋은 과목입니다.";
}

function matchCourse(courses: Course[], id: string) {
  const key = String(id || "").trim().toLowerCase();
  return courses.find((course) => {
    return [course.id, course.courseCode, course.name]
      .filter(Boolean)
      .some((value) => String(value).trim().toLowerCase() === key);
  });
}

function getPlanCourses(plan: PlanData | null | undefined, courses: Course[]) {
  if (!courses.length) return [];
  const ids = Array.isArray(plan?.courseIds) ? plan.courseIds : [];
  const matched = ids.map((id) => matchCourse(courses, id)).filter(Boolean) as Course[];
  if (matched.length > 0) return matched;
  return courses.slice(0, Math.min(7, courses.length));
}

function CourseDetailModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const [showSyllabus, setShowSyllabus] = useState(false);
  const reviews = getReviews(course);
  const syllabus = course.syllabus?.trim();

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600">{course.type}</span>
            <h2 className="text-2xl font-black text-slate-950">{course.name}</h2>
            <p className="mt-1 text-sm font-bold text-slate-400">
              {cleanDay(course.day)} {course.start}~{course.end} ㅣ {course.room || "강의실 미입력"} ㅣ {course.credit}학점
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="닫기">
            <X className="h-5 w-5" />
          </button>
        </div>

        <section className="mb-4 rounded-2xl bg-slate-50 p-4">
          <h3 className="mb-3 text-sm font-black text-slate-900">강의평 3개</h3>
          <div className="space-y-2">
            {reviews.map((review, index) => (
              <p key={index} className="rounded-xl bg-white px-4 py-3 text-sm font-bold leading-relaxed text-slate-600">
                {index + 1}. {review}
              </p>
            ))}
          </div>
        </section>

        <p className="mb-5 rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-600">{getSummary(course)}</p>

        <button onClick={() => setShowSyllabus(true)} className="w-full rounded-2xl bg-[#5B3FE8] px-5 py-3 text-sm font-black text-white">
          강의계획서 보기
        </button>
      </div>

      {showSyllabus && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-950">강의계획서</h3>
              <button onClick={() => setShowSyllabus(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="강의계획서 닫기">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="min-h-36 whitespace-pre-line rounded-2xl bg-slate-50 p-5 text-sm font-bold leading-relaxed text-slate-600">
              {syllabus || "아직 등록되지 않았습니다."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TimetableGrid({ courses, onCourseClick }: { courses: Course[]; onCourseClick: (course: Course) => void }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
      <h3 className="mb-4 border-l-4 border-[#9D91F7] pl-3 text-lg font-black text-slate-900">추천 시간표</h3>
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
        <div className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-slate-100 text-center text-sm font-black text-slate-900">
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
              const dayIndex = DAYS.indexOf(cleanDay(course.day));
              if (dayIndex < 0) return null;
              const top = timeToRow(course.start) * 56;
              const height = Math.max(42, (timeToRow(course.end) - timeToRow(course.start)) * 56 - 4);
              return (
                <button
                  key={`${course.id}-${index}`}
                  onClick={() => onCourseClick(course)}
                  className="absolute rounded-xl border border-black/5 p-2 text-left text-xs font-black text-slate-700 shadow-sm transition-transform hover:-translate-y-0.5"
                  style={{
                    left: `calc(${dayIndex * 20}% + 8px)`,
                    width: "calc(20% - 16px)",
                    top,
                    height,
                    backgroundColor: course.color || "#DDD6FE",
                  }}
                >
                  {course.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseList({ courses, onCourseClick }: { courses: Course[]; onCourseClick: (course: Course) => void }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="border-l-4 border-[#9D91F7] pl-3 text-lg font-black text-slate-900">추천 과목 목록</h3>
        <span className="text-sm font-black text-slate-400">총 {courses.length}개</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {courses.map((course) => (
          <div key={course.id} className="grid grid-cols-[8px_1fr_auto] items-center gap-3 rounded-2xl border border-slate-100 p-3">
            <span className="h-14 rounded-full" style={{ backgroundColor: course.color || "#9D91F7" }} />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-900">{course.name}</h4>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-500">{course.type}</span>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-400">
                {course.start}~{course.end} ㅣ {cleanDay(course.day)} ㅣ {course.room || "강의실 미입력"}
              </p>
            </div>
            <button onClick={() => onCourseClick(course)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700">
              강의정보
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ResultPage() {
  const [, setLocation] = useLocation();
  const [request, setRequest] = useState<PlanpickRequest | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PlanKey>("plan1");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const userName = getCurrentUserName() || "사용자";

  useEffect(() => {
    async function load() {
      const id = getCurrentRequestId();
      const [courses, req] = await Promise.all([getCoursesAsync(), id ? getRequestById(id) : Promise.resolve(null)]);
      setAllCourses(courses);
      setRequest(req);
      setLoading(false);
    }
    load();
  }, []);

  const result = request?.result;
  const activePlan = activeTab !== "planB" ? result?.[activeTab] : null;
  const selectedCourses = useMemo(() => getPlanCourses(activePlan, allCourses), [activePlan, allCourses]);
  const totalCredits = selectedCourses.reduce((sum, course) => sum + (course.credit || 0), 0);
  const courseTypes = new Set(selectedCourses.map((course) => course.type)).size;

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
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setLocation("/")} className="mb-3 flex items-center gap-2 text-lg font-black text-[#6B5DF6]">
              <ArrowLeft className="h-5 w-5" />
              대시보드
            </button>
            <h1 className="text-4xl font-black text-slate-950">{userName}님을 위한 시간표 추천 완료했습니다!</h1>
            <p className="mt-2 text-lg font-black text-[#6B5DF6]">DB에 저장된 강의 정보를 기준으로 시간표를 표시합니다.</p>
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
          <div className="mb-6 flex items-center gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-[#6B5DF6]">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900">AI 분석 요약</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { icon: Box, label: "추천 과목", value: `${selectedCourses.length}개` },
              { icon: GraduationCap, label: "총 학점", value: `${totalCredits}학점` },
              { icon: Users, label: "과목 종류", value: `${courseTypes}개` },
              { icon: CheckCircle, label: "Plan B 포함", value: result.planB ? "포함" : "미포함" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
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

        <div className="grid grid-cols-4 gap-3">
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
          <section className="rounded-3xl bg-white p-8 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <h2 className="mb-4 text-2xl font-black text-slate-900">Plan B</h2>
            <p className="whitespace-pre-line text-lg font-bold leading-relaxed text-slate-600">{result.planB || "대체 시간표는 아직 등록되지 않았습니다."}</p>
          </section>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2">
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
                  {(activePlan?.cons || "수강신청 전 실제 개설 여부 확인, 정원 변동 가능").split(/[,\n]/).map((item) => (
                    <li key={item}>• {item.trim()}</li>
                  ))}
                </ul>
              </section>
            </div>

            <TimetableGrid courses={selectedCourses} onCourseClick={setSelectedCourse} />
            <CourseList courses={selectedCourses} onCourseClick={setSelectedCourse} />
          </>
        )}

        <div className="flex justify-center gap-3 pb-4">
          <button onClick={() => setLocation("/request")} className="flex min-w-60 items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-black text-slate-900 shadow-sm">
            <RotateCcw className="h-5 w-5" />
            다시 추천받기
          </button>
          <button className="flex min-w-60 items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-black text-slate-900 shadow-sm">
            <Download className="h-5 w-5" />
            PDF 저장
          </button>
          <button className="flex min-w-60 items-center justify-center rounded-2xl bg-[#5B3FE8] px-8 py-4 text-lg font-black text-white shadow-lg">시간표 적용하기</button>
        </div>
      </div>

      {selectedCourse && <CourseDetailModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
    </div>
  );
}
