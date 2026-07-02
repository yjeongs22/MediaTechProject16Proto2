import React, { useMemo, useState } from "react";
import { Bell, CalendarDays, CheckCircle, Edit3, Sparkles } from "lucide-react";

type MemoMap = Record<string, string>;

const STORAGE_KEY = "planpickJulyMemos";
const JULY_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const FIRST_DAY_OFFSET = 3; // 2026-07-01 is Wednesday.

const DEFAULT_NOTES: Record<number, string> = {
  3: "수강신청 알림 설정 확인",
  10: "장학금 서류 준비",
  17: "공모전 지원 마감 체크",
  24: "자격증 원서 접수 확인",
};

function readMemos(): MemoMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as MemoMap;
  } catch {
    return {};
  }
}

export default function NotificationsPage() {
  const [memos, setMemos] = useState<MemoMap>(() => readMemos());
  const [selectedDay, setSelectedDay] = useState(1);

  const selectedKey = `2026-07-${String(selectedDay).padStart(2, "0")}`;
  const selectedMemo = memos[selectedKey] ?? DEFAULT_NOTES[selectedDay] ?? "";
  const filledDays = useMemo(() => new Set([...Object.keys(DEFAULT_NOTES).map(Number), ...Object.keys(memos).map((key) => Number(key.slice(-2)))]), [memos]);

  function updateMemo(value: string) {
    const next = { ...memos, [selectedKey]: value };
    if (!value.trim()) delete next[selectedKey];
    setMemos(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#6B5DF6] shadow-sm">
              <Bell className="h-4 w-4" />
              알림 캘린더
            </p>
            <h1 className="text-[34px] font-black text-slate-950 md:text-[42px]" style={{ fontFamily: "PlanPickAggro", fontWeight: 900 }}>
              2026년 7월 메모
            </h1>
            <p className="mt-2 text-base font-bold text-slate-400">날짜를 눌러 수강신청, 장학금, 공모전, 자격증 일정을 메모해요.</p>
          </div>
          <div className="rounded-3xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-black text-slate-400">메모 있는 날</p>
            <p className="mt-1 text-2xl font-black text-[#6B5DF6]">{filledDays.size}일</p>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-black text-slate-950">
                <CalendarDays className="h-5 w-5 text-[#6B5DF6]" />
                July 2026
              </h2>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600">클릭해서 메모</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-2 text-center text-xs font-black text-slate-400">
                  {day}
                </div>
              ))}

              {Array.from({ length: FIRST_DAY_OFFSET }).map((_, index) => (
                <div key={`empty-${index}`} className="min-h-24 rounded-2xl bg-slate-50/70" />
              ))}

              {JULY_DAYS.map((day) => {
                const key = `2026-07-${String(day).padStart(2, "0")}`;
                const memo = memos[key] ?? DEFAULT_NOTES[day] ?? "";
                const active = selectedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-24 rounded-2xl p-3 text-left transition-all ${
                      active ? "bg-[#6B5DF6] text-white shadow-lg shadow-indigo-200" : "bg-[#FAFAFF] text-slate-800 ring-1 ring-slate-100 hover:bg-[#F3F0FF]"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-black">{day}</span>
                      {memo && <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-[#6B5DF6]"}`} />}
                    </div>
                    <p className={`line-clamp-2 text-[11px] font-bold leading-relaxed ${active ? "text-white/80" : "text-slate-400"}`}>{memo || "메모 없음"}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="space-y-5">
            <section className="rounded-3xl bg-gradient-to-br from-[#6B5DF6] to-[#4F35D7] p-6 text-white shadow-[0_16px_35px_rgba(91,63,232,0.22)]">
              <div className="mb-5 flex items-center justify-between">
                <Sparkles className="h-9 w-9" />
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black">7월 {selectedDay}일</span>
              </div>
              <h2 className="text-2xl font-black">오늘의 알림 메모</h2>
              <p className="mt-2 text-sm font-bold leading-relaxed text-white/75">날짜별로 필요한 일정을 자유롭게 적어두면 이 페이지에서 바로 확인할 수 있어요.</p>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">
                <Edit3 className="h-5 w-5 text-[#6B5DF6]" />
                메모 작성
              </h3>
              <textarea
                value={selectedMemo}
                onChange={(event) => updateMemo(event.target.value)}
                placeholder="이 날짜에 기억할 내용을 적어주세요."
                className="h-40 w-full resize-none rounded-2xl border border-indigo-100 bg-[#FAFAFF] px-4 py-3 text-sm font-bold leading-relaxed text-slate-700 outline-none placeholder:text-slate-300 focus:border-[#6B5DF6] focus:ring-4 focus:ring-indigo-100"
              />
              <div className="mt-4 rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-[#6B5DF6]">
                <CheckCircle className="mr-2 inline h-4 w-4" />
                입력하면 자동 저장돼요.
              </div>
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}
