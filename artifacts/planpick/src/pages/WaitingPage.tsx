import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getCurrentRequestId, type PlanpickRequest } from "@/lib/storage";
import { Check, ShieldCheck, Sparkles, Star, Target, Zap } from "lucide-react";

export default function WaitingPage() {
  const [, setLocation] = useLocation();
  const [request, setRequest] = useState<PlanpickRequest | null>(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const id = getCurrentRequestId();
    if (!id) return;

    const ref = doc(db, "planpickMvp", "requests");
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const items: PlanpickRequest[] = Array.isArray(data?.items) ? data.items : [];
      const found = items.find((r) => r.id === id) ?? null;
      setRequest(found);
      if (found?.status === "complete" || found?.status === "완료") {
        setComplete(true);
      }
    });

    return () => unsub();
  }, []);

  const progress = complete ? 100 : 70;

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-5 flex items-center gap-5">
          <button
            type="button"
            onClick={() => setLocation("/request/needs")}
            className="flex h-10 items-center gap-1.5 rounded-2xl bg-[#ECE9FA] px-3.5 text-[14px] font-black text-slate-900"
          >
            뒤로
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#6B5DF6]">분석 대기</h1>
            <p className="mt-1 text-base font-bold text-slate-400">AI가 시간표 이미지를 분석하여 과목, 시간, 학점을 자동으로 인식하고 있습니다.</p>
          </div>
        </div>

        <section className="grid items-center gap-8 rounded-[28px] bg-white/92 px-8 py-12 shadow-[0_16px_38px_rgba(48,43,99,0.1)] ring-1 ring-[#E6E3F5] lg:grid-cols-[1fr_280px_1fr]">
          <div className="relative flex justify-center">
            <div className="absolute -top-7 left-8 rounded-[28px] bg-indigo-100 px-7 py-4 text-base font-black text-[#6B5DF6] shadow-sm">
              AI가 시간표를 분석하고 있어요!
            </div>
            <img src={`${import.meta.env.BASE_URL}robot.png`} alt="분석 로봇" className="h-80 w-80 object-contain drop-shadow-2xl" />
          </div>

          <div className="relative mx-auto flex h-60 w-60 items-center justify-center rounded-full">
            <div className="absolute inset-0 rounded-full border-[18px] border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-[18px] border-[#6B5DF6] border-r-indigo-100 border-b-indigo-100" />
            <div className="text-center">
              <span className="text-6xl font-black text-[#6B5DF6]">{progress}</span>
              <span className="text-2xl font-black text-[#6B5DF6]">%</span>
            </div>
          </div>

          <div>
            <span className="mb-6 inline-flex rounded-xl bg-indigo-100 px-5 py-2 text-base font-black text-[#6B5DF6]">
              {complete ? "분석 완료" : "분석 진행중"}
            </span>
            <h2 className="text-4xl font-black text-slate-950">
              {complete ? "추천 결과가 준비됐어요" : "시간표를 분석하고 있어요"}
            </h2>
            <p className="mt-4 text-lg font-bold leading-relaxed text-slate-400">
              {complete ? "결과 화면에서 추천 시간표를 확인해주세요." : "잠시만 기다려 주세요. 약 5초 정도 소요됩니다."}
            </p>

            <div className="mt-16 flex items-center gap-0">
              {[0, 1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${step < 2 || complete ? "bg-[#6B5DF6] text-white" : step === 2 ? "bg-indigo-100 text-[#6B5DF6] ring-8 ring-indigo-50" : "bg-slate-100 text-slate-300"}`}>
                    {step < 2 || complete ? <Check className="h-5 w-5" /> : <span className="h-3 w-3 rounded-full border-4 border-current" />}
                  </div>
                  {step < 3 && <div className={`h-0.5 w-20 ${step < 2 || complete ? "bg-[#6B5DF6]" : "bg-slate-200"}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-[28px] bg-indigo-50 px-10 py-8">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#6B5DF6] shadow-sm">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#6B5DF6]">더 정확한 추천을 위해 최선을 다하고 있어요!</h3>
                <p className="mt-2 text-base font-bold text-slate-400">분석이 완료되면 최적의 시간표를 추천해드릴게요.</p>
              </div>
            </div>
            <span className="hidden text-5xl lg:block">🎓</span>
          </div>
        </section>

        <section className="mt-7 grid gap-4 rounded-[28px] bg-white px-8 py-6 shadow-[0_12px_30px_rgba(48,43,99,0.07)] md:grid-cols-4">
          {[
            { icon: Target, title: "AI 정확도", text: "95% 이상의 분석 정확도" },
            { icon: Zap, title: "빠른 분석", text: "5초 내외 빠른 처리" },
            { icon: ShieldCheck, title: "보안 안전", text: "개인 정보 안전 보호" },
            { icon: Star, title: "최적 추천", text: "맞춤형 시간표 추천" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#6B5DF6]">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">{title}</h4>
                <p className="text-sm font-bold text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </section>

        {request && (
          <p className="mt-4 text-sm font-bold text-slate-400">
            요청 조건: {request.needText}
          </p>
        )}

        {complete && (
          <button
            data-testid="btn-view-results"
            onClick={() => setLocation("/results")}
            className="mt-6 rounded-2xl bg-[#6B5DF6] px-8 py-4 text-base font-black text-white"
          >
            결과 확인하기
          </button>
        )}
      </div>
    </div>
  );
}
