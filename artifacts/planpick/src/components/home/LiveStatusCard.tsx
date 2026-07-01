import React, { useEffect, useState } from "react";
import { Bell, BellOff, CalendarCheck } from "lucide-react";

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
        if (hours < 0) return { hours: 0, minutes: 0, seconds: 0 };
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <section className="flex h-48 flex-col rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="whitespace-nowrap font-bold text-[#1F1543]">실시간 수강신청 현황</h3>
        <button
          type="button"
          onClick={() => setAlarmOn((value) => !value)}
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
            alarmOn ? "bg-[#5B4CF2] text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-[#E9E6FF] hover:text-[#5B4CF2]"
          }`}
        >
          {alarmOn ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
          {alarmOn ? "알림 옴" : "알림 안 옴"}
        </button>
      </div>

      <div className="flex flex-1 items-center gap-6 rounded-2xl bg-[#F8F9FE] p-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E9E6FF] text-[#5B4CF2] shadow-sm">
          <CalendarCheck className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-xs font-semibold text-[#5B4CF2]">신청 시작까지</p>
          <div className="flex items-end gap-2">
            <TimeBlock value={formatNumber(timeLeft.hours)} label="시간" />
            <span className="mb-4 text-2xl font-bold text-[#5B4CF2]">:</span>
            <TimeBlock value={formatNumber(timeLeft.minutes)} label="분" />
            <span className="mb-4 text-2xl font-bold text-[#5B4CF2]">:</span>
            <TimeBlock value={formatNumber(timeLeft.seconds)} label="초" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-bold tracking-wider text-[#1F1543]">{value}</span>
      <span className="mt-1 text-[10px] text-gray-500">{label}</span>
    </div>
  );
}
