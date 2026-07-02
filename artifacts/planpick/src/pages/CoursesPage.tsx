import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, FileText, GraduationCap, Search, Star, X } from "lucide-react";
import { getCoursesAsync, type Course } from "@/lib/courses";

function formatSchedule(course: Course) {
  const schedules = course.schedule?.length ? course.schedule : [{ day: course.day, start: course.start, end: course.end, room: course.room }];
  return schedules.map((item) => `${item.day} ${item.start}~${item.end}${item.room ? ` · ${item.room}` : ""}`).join(" / ");
}

function getReviews(course: Course) {
  if (Array.isArray(course.reviewItems) && course.reviewItems.length > 0) return course.reviewItems.slice(0, 3);
  if (course.review) return course.review.split(/\n+/).filter(Boolean).slice(0, 3);
  return ["등록된 강의평이 없습니다."];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoursesAsync()
      .then(setCourses)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return courses;
    return courses.filter((course) =>
      [course.name, course.type, course.courseCode, course.room, course.reviewSummary].some((value) => String(value || "").toLowerCase().includes(keyword)),
    );
  }, [courses, query]);

  const totalCredits = courses.reduce((sum, course) => sum + Number(course.credit || 0), 0);

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#6B5DF6] shadow-sm">
              <BookOpen className="h-4 w-4" />
              DB 강의목록
            </p>
            <h1 className="text-[34px] font-black text-slate-950 md:text-[42px]" style={{ fontFamily: "PlanPickAggro", fontWeight: 900 }}>
              강의목록
            </h1>
            <p className="mt-2 text-base font-bold text-slate-400">과목, 시간, 학점, 강의평을 한 번에 확인해요.</p>
          </div>
          <div className="flex min-w-[280px] items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
            <Search className="h-5 w-5 text-slate-300" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="과목명, 코드, 유형 검색" className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-300" />
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          <SummaryCard icon={<BookOpen className="h-6 w-6" />} label="등록 과목" value={`${courses.length}개`} />
          <SummaryCard icon={<GraduationCap className="h-6 w-6" />} label="총 학점" value={`${totalCredits}학점`} />
          <SummaryCard icon={<CalendarDays className="h-6 w-6" />} label="검색 결과" value={`${filtered.length}개`} />
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">과목 리스트</h2>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-[#6B5DF6]">{loading ? "불러오는 중" : `${filtered.length}개`}</span>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-[#FAFAFF] p-8 text-center text-sm font-black text-slate-400">강의 데이터를 불러오는 중입니다...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-[#FAFAFF] p-8 text-center text-sm font-black text-slate-400">검색 결과가 없습니다.</div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filtered.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => setSelected(course)}
                  className="grid grid-cols-[10px_1fr] gap-4 rounded-2xl bg-[#FAFAFF] p-4 text-left ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:bg-[#F4F1FF]"
                >
                  <span className="h-full min-h-24 rounded-full" style={{ backgroundColor: course.color || "#9D91F7" }} />
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-slate-950">{course.name}</h3>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#6B5DF6]">{course.type}</span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-400">{course.credit}학점</span>
                    </div>
                    <p className="text-xs font-black text-slate-400">{course.courseCode}</p>
                    <p className="mt-2 text-sm font-bold text-slate-600">{formatSchedule(course)}</p>
                    <p className="mt-3 line-clamp-2 text-sm font-bold leading-relaxed text-slate-400">{course.reviewSummary || course.review || "강의 요약이 없습니다."}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {selected && <CourseModal course={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#6B5DF6]">{icon}</div>
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function CourseModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const [showPlan, setShowPlan] = useState(false);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600">{course.type}</span>
            <h2 className="text-2xl font-black text-slate-950">{course.name}</h2>
            <p className="mt-1 text-sm font-bold text-slate-400">{course.courseCode} · {course.credit}학점</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="닫기">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <InfoBox label="시간" value={formatSchedule(course)} />
          <InfoBox label="난이도" value={course.difficulty || "미등록"} />
          <InfoBox label="팀플" value={course.team || "미등록"} />
        </div>

        <section className="mb-4 rounded-2xl bg-[#FAFAFF] p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-900">
            <Star className="h-4 w-4 text-[#6B5DF6]" />
            강의평
          </h3>
          <div className="space-y-2">
            {getReviews(course).map((review, index) => (
              <p key={`${review}-${index}`} className="rounded-xl bg-white px-4 py-3 text-sm font-bold leading-relaxed text-slate-600">
                {index + 1}. {review}
              </p>
            ))}
          </div>
        </section>

        <p className="mb-4 rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-black leading-relaxed text-indigo-600">
          한 줄 요약: {course.reviewSummary || "등록된 요약이 없습니다."}
        </p>

        <button onClick={() => setShowPlan((value) => !value)} className="w-full rounded-2xl bg-[#5B3FE8] px-5 py-3 text-sm font-black text-white">
          <FileText className="mr-2 inline h-4 w-4" />
          강의계획서 {showPlan ? "닫기" : "보기"}
        </button>

        {showPlan && (
          <div className="mt-4 max-h-[60vh] overflow-auto rounded-2xl bg-slate-50 p-5">
            {course.syllabusImageDataUrl ? (
              <img src={course.syllabusImageDataUrl} alt={`${course.name} 강의계획서`} className="mx-auto max-w-full rounded-xl" />
            ) : (
              <p className="whitespace-pre-line text-sm font-bold leading-relaxed text-slate-600">{course.syllabus || "아직 등록되지 않았습니다."}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#FAFAFF] px-4 py-3">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black leading-relaxed text-slate-800">{value}</p>
    </div>
  );
}
