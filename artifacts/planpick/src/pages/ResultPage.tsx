import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, ArrowLeft, Box, CheckCircle, Download, Minus, Plus, RotateCcw, Star, ThumbsUp, Users, X } from "lucide-react";
import { getCurrentUserName } from "@/lib/auth";
import { getCoursesAsync, type Course, type CourseSchedule } from "@/lib/courses";
import { getMicroDegrees, type MicroDegreeInfo } from "@/lib/microDegrees";
import { getCurrentRequestId, getRequestById, type PlanData, type PlanpickRequest } from "@/lib/storage";

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
  if (Array.isArray(course.reviewItems) && course.reviewItems.length > 0) return course.reviewItems.slice(0, 3);
  if (course.review) {
    return course.review
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  return ["등록된 강의평이 없습니다."];
}

function getSummary(course: Course) {
  if (course.reviewSummary) return course.reviewSummary;
  if (course.difficulty === "높음") return "난이도는 있지만 전공 이해도 향상에 도움이 되는 과목입니다.";
  if (course.team === "있음") return "팀 활동이 있어 일정 관리가 중요한 과목입니다.";
  return "시간표 균형을 크게 해치지 않으면서 채우기 좋은 과목입니다.";
}

function getSchedules(course: Course): CourseSchedule[] {
  if (Array.isArray(course.schedule) && course.schedule.length > 0) return course.schedule;
  return [{ day: course.day, start: course.start, end: course.end, room: course.room }];
}

function formatSchedules(course: Course) {
  return getSchedules(course)
    .map((schedule) => `${cleanDay(schedule.day)} ${schedule.start}~${schedule.end}${schedule.room ? ` ${schedule.room}` : ""}`)
    .join(" / ");
}

function matchCourse(courses: Course[], id: string) {
  const key = String(id || "").trim().toLowerCase();
  return courses.find((course) =>
    [course.id, course.courseCode, course.name].filter(Boolean).some((value) => String(value).trim().toLowerCase() === key),
  );
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
  const [syllabusZoom, setSyllabusZoom] = useState(1);
  const reviews = getReviews(course);
  const syllabus = course.syllabus?.trim();
  const syllabusImage = course.syllabusImageDataUrl?.trim();

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600">{course.type}</span>
            <h2 className="text-2xl font-black text-slate-950">{course.name}</h2>
            <p className="mt-1 text-sm font-bold text-slate-400">
              {formatSchedules(course)} | {course.credit}학점
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

        <p className="mb-5 rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-black leading-relaxed text-indigo-600">한 줄 요약: {getSummary(course)}</p>

        <button onClick={() => setShowSyllabus(true)} className="w-full rounded-2xl bg-[#5B3FE8] px-5 py-3 text-sm font-black text-white">
          강의 계획서 보기
        </button>
      </div>

      {showSyllabus && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-950">강의 계획서</h3>
              <div className="flex items-center gap-2">
                {syllabusImage && (
                  <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setSyllabusZoom((value) => Math.max(0.75, value - 0.25))}
                      className="rounded-full p-1.5 text-slate-500 hover:bg-white hover:text-slate-900"
                      aria-label="강의 계획서 축소"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-xs font-black text-slate-500">{Math.round(syllabusZoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setSyllabusZoom((value) => Math.min(2.5, value + 0.25))}
                      className="rounded-full p-1.5 text-slate-500 hover:bg-white hover:text-slate-900"
                      aria-label="강의 계획서 확대"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <button onClick={() => setShowSyllabus(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="강의 계획서 닫기">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-slate-50 p-5">
              {syllabusImage ? (
                <img
                  src={syllabusImage}
                  alt={`${course.name} 강의 계획서`}
                  className="mx-auto max-w-none rounded-xl object-contain transition-transform"
                  style={{ width: `${syllabusZoom * 100}%` }}
                />
              ) : (
                <p className="min-h-36 whitespace-pre-line text-sm font-bold leading-relaxed text-slate-600">
                  {syllabus || "아직 등록되지 않았습니다."}
                </p>
              )}
            </div>
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
            {courses.flatMap((course, courseIndex) =>
              getSchedules(course).map((schedule, scheduleIndex) => {
                const dayIndex = DAYS.indexOf(cleanDay(schedule.day));
                if (dayIndex < 0) return null;
                const top = timeToRow(schedule.start) * 56;
                const height = Math.max(42, (timeToRow(schedule.end) - timeToRow(schedule.start)) * 56 - 4);
                return (
                  <button
                    key={`${course.id}-${courseIndex}-${scheduleIndex}`}
                    onClick={() => onCourseClick(course)}
                    className="absolute overflow-hidden rounded-xl border border-black/5 p-2 text-left text-xs font-black text-slate-700 shadow-sm transition-transform hover:-translate-y-0.5"
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
              }),
            )}
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
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-black text-slate-900">{course.name}</h4>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-500">{course.type}</span>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-400">{formatSchedules(course)}</p>
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

function MicroDegreeRecommendation({ userName, microDegree, allMicroDegrees }: { userName: string; microDegree: MicroDegreeInfo | null; allMicroDegrees: MicroDegreeInfo[] }) {
  const [showAll, setShowAll] = useState(false);
  if (!microDegree) return null;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#6B5DF6]">{userName}님을 위한 MD 추천</p>
          <h3 className="mt-1 text-2xl font-black text-slate-950">{microDegree.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600">Micro Degree</span>
          <button type="button" onClick={() => setShowAll(true)} className="rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-black text-[#6B5DF6]">
            더보기
          </button>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {microDegree.area && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{microDegree.area}</span>}
        {microDegree.level && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{microDegree.level}</span>}
        {microDegree.universities?.slice(0, 3).map((university) => (
          <span key={university} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
            {university}
          </span>
        ))}
      </div>
      <p className="rounded-2xl bg-[#F5F3FF] px-4 py-3 text-sm font-bold leading-relaxed text-slate-600">{microDegree.summary}</p>
      <p className="mt-3 text-sm font-bold leading-relaxed text-slate-500">{microDegree.reason}</p>
      {microDegree.courses.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {microDegree.courses.slice(0, 5).map((course) => (
            <span key={course} className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#6B5DF6] ring-1 ring-indigo-100">
              #{course}
            </span>
          ))}
        </div>
      )}
      {showAll && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[86vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-[#6B5DF6]">전체 마이크로디그리 과목</p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">MD 추천 데이터</h3>
              </div>
              <button onClick={() => setShowAll(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="MD 목록 닫기">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[68vh] space-y-4 overflow-auto pr-2">
              {allMicroDegrees.map((md) => (
                <article key={md.id} className="rounded-2xl border border-slate-100 bg-[#FAFAFF] p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-lg font-black text-slate-950">{md.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {md.area && <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-indigo-500 ring-1 ring-indigo-100">{md.area}</span>}
                      {md.level && <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-indigo-500 ring-1 ring-indigo-100">{md.level}</span>}
                    </div>
                  </div>
                  <p className="text-sm font-bold leading-relaxed text-slate-500">{md.summary}</p>
                  {md.universities && md.universities.length > 0 && <p className="mt-2 text-xs font-black text-slate-400">참여 대학: {md.universities.join(", ")}</p>}
                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {md.courses.map((course) => (
                      <span key={`${md.id}-${course}`} className="rounded-xl bg-white px-3 py-2 text-sm font-black text-slate-700 ring-1 ring-slate-100">
                        {course}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function ResultPage() {
  const [, setLocation] = useLocation();
  const [request, setRequest] = useState<PlanpickRequest | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [microDegrees, setMicroDegrees] = useState<MicroDegreeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PlanKey>("plan1");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const userName = getCurrentUserName() || "사용자";

  useEffect(() => {
    async function load() {
      const id = getCurrentRequestId();
      const [courses, req, mdItems] = await Promise.all([getCoursesAsync(), id ? getRequestById(id) : Promise.resolve(null), getMicroDegrees()]);
      setAllCourses(courses);
      setRequest(req);
      setMicroDegrees(mdItems);
      setLoading(false);
    }
    load();
  }, []);

  const result = request?.result;
  const activePlan = activeTab !== "planB" ? result?.[activeTab] : null;
  const selectedCourses = useMemo(() => getPlanCourses(activePlan, allCourses), [activePlan, allCourses]);
  const selectedMicroDegree = useMemo(() => {
    if (microDegrees.length === 0) return null;
    const courseNames = new Set(selectedCourses.map((course) => course.name));
    return [...microDegrees].sort((a, b) => {
      const aScore = a.courses.filter((course) => courseNames.has(course)).length;
      const bScore = b.courses.filter((course) => courseNames.has(course)).length;
      return bScore - aScore;
    })[0];
  }, [microDegrees, selectedCourses]);
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
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button onClick={() => setLocation("/")} className="mb-2 inline-flex items-center gap-1 text-sm font-black text-[#6B5DF6]">
              <ArrowLeft className="h-4 w-4" /> 대시보드
            </button>
            <h1 className="text-[34px] font-black text-slate-950 md:text-[42px]" style={{ fontFamily: "PlanPickAggro", fontWeight: 900 }}>
              {userName}님을 위한 시간표 추천 완료했습니다!
            </h1>
            <p className="mt-1 text-base font-black" style={{ color: "#6B5DF6" }}>AI가 졸업요건과 선호도를 분석하여 추천한 결과입니다.</p>
          </div>
          <div className="flex gap-3">
            <a href="https://time.navyism.com/?host=www.konkuk.ac.kr" className="rounded-xl bg-white px-6 py-3 text-sm font-black text-slate-800 shadow-sm ring-1 ring-slate-100">
              서비스시간
            </a>
            <a href="https://sugang.konkuk.ac.kr/" className="rounded-xl bg-[#5B3FE8] px-6 py-3 text-sm font-black text-white shadow-sm">
              수강신청
            </a>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-slate-900">
              <Box className="h-5 w-5 text-[#6B5DF6]" /> AI 분석 요약
            </h2>
            <div className="grid gap-4 md:grid-cols-4">
              <SummaryItem icon={<Box className="h-5 w-5" />} label="추천 과목" value={`${selectedCourses.length}개`} />
              <SummaryItem icon={<Users className="h-5 w-5" />} label="총 학점" value={`${totalCredits}학점`} />
              <SummaryItem icon={<Star className="h-5 w-5" />} label="과목 종류" value={`${courseTypes}개`} />
              <SummaryItem icon={<CheckCircle className="h-5 w-5" />} label="Plan B 포함" value="포함" />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-black text-slate-900">추천 정확도</h2>
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-[8px] border-[#6B5DF6] text-center">
                <span className="text-3xl font-black text-slate-950">95%</span>
              </div>
            </div>
          </div>
        </section>

        <nav className="grid gap-3 md:grid-cols-4">
          {PLAN_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl px-5 py-4 text-sm font-black shadow-sm transition-colors ${
                activeTab === tab.key ? "bg-[#5B3FE8] text-white" : "bg-white text-slate-800 ring-1 ring-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "planB" ? (
          <section className="rounded-3xl bg-white p-7 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <h2 className="mb-4 text-2xl font-black text-slate-950">Plan B</h2>
            <p className="whitespace-pre-line rounded-2xl bg-indigo-50 p-5 text-base font-bold leading-8 text-slate-700">
              {result.planB || "관리자가 등록한 Plan B가 아직 없습니다."}
            </p>
          </section>
        ) : (
          <>
            <section className="grid gap-5 md:grid-cols-2">
              <InfoCard icon={<ThumbsUp className="h-5 w-5 text-emerald-500" />} title="장점" text={activePlan?.pros || "장점 정보가 아직 등록되지 않았습니다."} />
              <InfoCard icon={<AlertTriangle className="h-5 w-5 text-orange-500" />} title="주의사항" text={activePlan?.cons || "주의사항 정보가 아직 등록되지 않았습니다."} />
            </section>
            <TimetableGrid courses={selectedCourses} onCourseClick={setSelectedCourse} />
            <CourseList courses={selectedCourses} onCourseClick={setSelectedCourse} />
            <MicroDegreeRecommendation userName={userName} microDegree={selectedMicroDegree} allMicroDegrees={microDegrees} />
          </>
        )}

        <footer className="grid gap-3 md:grid-cols-3">
          <button onClick={() => setLocation("/request/conditions")} className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-900 shadow-sm ring-1 ring-slate-100">
            <RotateCcw className="mr-2 inline h-4 w-4" /> 다시 추천받기
          </button>
          <button className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-900 shadow-sm ring-1 ring-slate-100">
            <Download className="mr-2 inline h-4 w-4" /> PDF 저장
          </button>
          <button className="rounded-2xl bg-[#5B3FE8] px-5 py-4 text-sm font-black text-white shadow-sm">시간표 적용하기</button>
        </footer>
      </div>

      {selectedCourse && <CourseDetailModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
    </div>
  );
}

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-[#6B5DF6]">{icon}</span>
      <span>
        <p className="text-xs font-black text-slate-400">{label}</p>
        <p className="text-lg font-black text-slate-950">{value}</p>
      </span>
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900">
        {icon} {title}
      </h3>
      <p className="whitespace-pre-line text-sm font-bold leading-7 text-slate-600">{text}</p>
    </section>
  );
}
