import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check, ShieldCheck, Sparkles, Star, Target, Zap } from "lucide-react";

function ProgressRing({ progress }: { progress: number }) {
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative mx-auto flex h-60 w-60 items-center justify-center">
      <svg viewBox="0 0 220 220" className="-rotate-90">
        <circle cx="110" cy="110" r={radius} fill="none" stroke="#EEE9FF" strokeWidth="18" />
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="#6B5DF6"
          strokeWidth="18"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-6xl font-black text-[#6B5DF6]">{progress}</span>
        <span className="text-2xl font-black text-[#6B5DF6]">%</span>
      </div>
    </div>
  );
}

export default function ContestWaitingPage() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(1);
  const complete = progress >= 100;
  const statusText = useMemo(() => (complete ? "분석 완료" : "분석 진행중"), [complete]);

  useEffect(() => {
    const duration = 5000;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.min(100, Math.max(1, Math.floor(1 + (elapsed / duration) * 99)));
      setProgress(next);
      if (next >= 100) window.clearInterval(timer);
    }, 220);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!complete) return;
    const timer = window.setTimeout(() => setLocation("/contests"), 700);
    return () => window.clearTimeout(timer);
  }, [complete, setLocation]);

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-5 flex items-center gap-5">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="flex h-10 items-center gap-1.5 rounded-2xl bg-[#ECE9FA] px-3.5 text-[14px] font-black text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로
          </button>
        </div>

        <section className="grid items-center gap-8 rounded-[28px] bg-white/92 px-8 py-12 shadow-[0_16px_38px_rgba(48,43,99,0.1)] ring-1 ring-[#E6E3F5] lg:grid-cols-[1fr_280px_1fr]">
          <div className="relative flex justify-center">
            <div className="absolute -top-7 left-8 rounded-[28px] bg-indigo-100 px-7 py-4 text-base font-black text-[#6B5DF6] shadow-sm">
              AI가 맞춤 공모전과 대외활동을 찾고 있어요!
            </div>
            <img src={`${import.meta.env.BASE_URL}robot.png`} alt="공모전 분석 로봇" className="h-80 w-80 object-contain drop-shadow-2xl" />
          </div>

          <ProgressRing progress={progress} />

          <div>
            <span className="mb-6 inline-flex rounded-xl bg-indigo-100 px-5 py-2 text-base font-black text-[#6B5DF6]">{statusText}</span>
            <h2 className="text-4xl font-black text-slate-950">공모전 및 대외활동을 분석하고 있어요.</h2>
            <p className="mt-4 text-lg font-bold leading-relaxed text-slate-400">
              잠시만 기다려 주세요.
              <br />약 5초 정도 소요됩니다.
            </p>

            <div className="mt-16 flex items-center gap-0">
              {[0, 1, 2, 3].map((step) => {
                const done = progress >= [25, 50, 75, 100][step];
                return (
                  <React.Fragment key={step}>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${done ? "bg-[#6B5DF6] text-white" : "bg-slate-100 text-slate-300"}`}>
                      {done ? <Check className="h-5 w-5" /> : <span className="h-3 w-3 rounded-full border-4 border-current" />}
                    </div>
                    {step < 3 && <div className={`h-0.5 w-20 ${progress >= [38, 63, 88][step] ? "bg-[#6B5DF6]" : "bg-slate-200"}`} />}
                  </React.Fragment>
                );
              })}
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
                <h3 className="text-xl font-black text-[#6B5DF6]">나에게 맞는 기회를 놓치지 마세요!</h3>
                <p className="mt-2 text-base font-bold text-slate-400">지원 시기, 모집 조건, 활동 혜택까지 꼼꼼히 분석해 드려요.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-4 rounded-[28px] bg-white px-8 py-6 shadow-[0_12px_30px_rgba(48,43,99,0.07)] md:grid-cols-4">
          {[
            { icon: Target, title: "맞춤 추천", text: "관심 분야 기반 추천" },
            { icon: Zap, title: "신청 정보 분석", text: "모집 기간, 조건, 혜택 정리" },
            { icon: ShieldCheck, title: "경쟁률 예측", text: "유사 공모전 데이터 분석" },
            { icon: Star, title: "최적 타이밍 안내", text: "지원 시기 알림 제공" },
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
      </div>
    </div>
  );
}
