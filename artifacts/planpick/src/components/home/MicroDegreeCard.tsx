import React, { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, X } from "lucide-react";
import { getMicroDegrees, type MicroDegreeInfo } from "@/lib/microDegrees";

export function MicroDegreeCard() {
  const [items, setItems] = useState<MicroDegreeInfo[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    getMicroDegrees().then((data) => {
      if (mounted) setItems(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const featured = useMemo(() => items[0] ?? null, [items]);
  const totalCourses = useMemo(() => items.reduce((sum, item) => sum + item.courses.length, 0), [items]);

  return (
    <section className="flex h-48 flex-col overflow-hidden rounded-[32px] border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="whitespace-nowrap text-sm font-bold text-[#1F1543]">MD 추천</h3>
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="shrink-0 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[11px] font-black text-[#5B4CF2]"
        >
          더보기
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between rounded-2xl bg-[#F8F9FE] p-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E9E6FF] text-[#5B4CF2] shadow-sm">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-black text-[#1F1543]">{featured?.name ?? "마이크로디그리"}</p>
            <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-relaxed text-gray-500">{featured?.summary ?? "MD 데이터를 불러오는 중입니다."}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[#5B4CF2] shadow-sm">{items.length || "--"}개 MD</span>
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[#5B4CF2] shadow-sm">{totalCourses || "--"}개 과목</span>
        </div>
      </div>

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
              {items.map((md) => (
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
