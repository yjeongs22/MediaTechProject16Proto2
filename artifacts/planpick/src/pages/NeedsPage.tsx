import React, { useState } from "react";
import { useLocation } from "wouter";
import { getCurrentRequestId, getData, upsertRequest, type PlanpickRequest, type StudentInfo } from "@/lib/storage";
import { ArrowLeft, BotMessageSquare, Sparkles } from "lucide-react";
import logoImg from "@assets/image-Photoroom_1782734124454.png";

export default function NeedsPage() {
  const [, setLocation] = useLocation();
  const [needText, setNeedText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!needText.trim() || submitting) return;
    setSubmitting(true);

    const student = getData<StudentInfo>("planpickStudent");
    const requestId = getCurrentRequestId() ?? String(Date.now());

    const request: PlanpickRequest = {
      id: requestId,
      student: student ?? { school: "", major: "", studentNumber: "", grade: "", targetCredit: 18 },
      needText: needText.trim(),
      status: "pending",
      createdAt: Date.now(),
    };

    await upsertRequest(request);
    setLocation("/request/waiting");
  }

  return (
    <div className="min-h-full overflow-hidden bg-[#F4F2FF] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
            <BotMessageSquare className="h-5 w-5 text-[#6B5DF6]" />
          </div>
          <img src={logoImg} alt="PlanPick" className="h-10 w-auto object-contain" />
          <span className="text-3xl font-black text-slate-300">AI</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-[28px] bg-white/92 p-8 shadow-[0_16px_38px_rgba(48,43,99,0.1)] ring-1 ring-[#E6E3F5] backdrop-blur md:p-10"
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-indigo-100/70" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-100/70" />
          <img
            src={`${import.meta.env.BASE_URL}robot.png`}
            alt="PlanPick AI 로봇"
            className="pointer-events-none absolute right-12 top-12 hidden h-72 w-72 object-contain drop-shadow-2xl lg:block"
          />
          <div className="absolute right-12 top-24 hidden rounded-[28px] bg-indigo-100 px-7 py-4 text-3xl font-black text-indigo-500 shadow-sm lg:block">
            ...
          </div>

          <div className="relative z-10 max-w-[780px]">
            <h1 className="mb-6 text-[44px] font-black leading-tight text-[#6B5DF6] md:text-[56px]">원하는 시간표 조건</h1>
            <p className="text-xl font-black text-slate-800">원하는 조건을 문장으로 적어주세요.</p>
            <p className="mt-2 text-lg font-bold text-slate-400">예: 오전 수업은 피하고 싶고, 금요일 공강이면 좋겠어요.</p>

            <div className="mt-20">
              <label className="mb-3 block text-lg font-black text-slate-800">자유입력</label>
              <div className="relative">
                <textarea
                  data-testid="textarea-needs"
                  value={needText}
                  onChange={(e) => setNeedText(e.target.value.slice(0, 500))}
                  placeholder="예: 전공필수는 포함해주세요. 이동시간이 짧았으면 좋겠습니다."
                  className="h-48 w-full resize-none rounded-2xl border border-[#9D91F7] bg-white/90 px-5 py-4 text-base font-bold text-slate-800 outline-none shadow-[0_8px_20px_rgba(89,75,180,0.12)] placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-100"
                />
                <span className="absolute bottom-4 right-5 text-lg font-black text-slate-300">{needText.length} / 500</span>
              </div>
            </div>

            <button
              data-testid="btn-submit-needs"
              type="submit"
              disabled={!needText.trim() || submitting}
              className="mt-8 rounded-[24px] bg-[#5538F2] px-10 py-4 text-lg font-black text-white shadow-[0_14px_22px_rgba(85,56,242,0.28)] transition-colors hover:bg-[#472BD8] disabled:opacity-50"
            >
              <Sparkles className="mr-2 inline h-5 w-5" />
              {submitting ? "생성 중..." : "AI 시간표 생성"}
            </button>
          </div>
        </form>

        <button
          onClick={() => setLocation("/request")}
          className="mt-8 flex items-center gap-2 text-2xl font-black text-[#6B5DF6]"
          data-testid="btn-back"
        >
          <ArrowLeft className="h-6 w-6" />
          이전
        </button>
      </div>
    </div>
  );
}
