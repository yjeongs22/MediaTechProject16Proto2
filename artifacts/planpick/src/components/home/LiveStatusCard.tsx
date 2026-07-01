import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bell, BellOff, Calendar } from "lucide-react";

export function LiveStatusCard() {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 34, seconds: 56 });
  const [alarmOn, setAlarmOn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds -= 1;
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }
        if (minutes < 0) {
          minutes = 59;
          hours -= 1;
        }
        if (hours < 0) {
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <Card className="h-full rounded-2xl border border-slate-100 shadow-sm">
      <CardContent className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50">
              <Calendar className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-base font-bold leading-snug text-slate-800">실시간 수강신청 현황</h3>
          </div>
          <button className="flex shrink-0 items-center whitespace-nowrap text-xs text-slate-500 transition-colors hover:text-indigo-600" data-testid="link-status-more">
            더보기
            <ArrowRight className="ml-1 h-3 w-3" />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-5">
          <div className="mb-3 text-sm font-medium text-slate-500">신청 시작까지</div>
          <div className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-800 tabular-nums">
            <div className="flex flex-col items-center">
              <span>{formatNumber(timeLeft.hours)}</span>
              <span className="mt-1 text-[10px] font-normal text-slate-400">시간</span>
            </div>
            <span className="pb-4 text-slate-300">:</span>
            <div className="flex flex-col items-center">
              <span>{formatNumber(timeLeft.minutes)}</span>
              <span className="mt-1 text-[10px] font-normal text-slate-400">분</span>
            </div>
            <span className="pb-4 text-slate-300">:</span>
            <div className="flex flex-col items-center text-indigo-600">
              <span>{formatNumber(timeLeft.seconds)}</span>
              <span className="mt-1 text-[10px] font-normal text-slate-400">초</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setAlarmOn((v) => !v)}
          className={`mt-4 flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
            alarmOn
              ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
          }`}
          data-testid="btn-alarm-toggle"
        >
          {alarmOn ? (
            <>
              <Bell className="h-4 w-4" /> 알림 설정됨
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4" /> 수강신청 시작 알림 받기
            </>
          )}
        </button>
      </CardContent>
    </Card>
  );
}
