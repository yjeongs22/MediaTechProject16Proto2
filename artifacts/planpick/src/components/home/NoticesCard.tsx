import React from "react";
import { ArrowRight } from "lucide-react";

const notices = [
  "2026-2학기 수강신청 안내",
  "교양 과목 변경 사항 안내",
  "시스템 점검 안내 (7/25)",
  "2026학년도 하계 계절학기 모집",
];

export function NoticesCard() {
  return (
    <section className="flex h-48 flex-col rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-[#1F1543]">공지사항</h3>
        <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
      <ul className="flex flex-1 flex-col gap-3 overflow-y-auto pr-2">
        {notices.map((notice) => (
          <li key={notice} className="truncate text-sm text-gray-600 transition-colors hover:text-[#5B4CF2]">
            {notice}
          </li>
        ))}
      </ul>
    </section>
  );
}
