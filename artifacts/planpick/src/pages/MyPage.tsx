import React, { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Award, BadgeCheck, BookOpenCheck, CalendarCheck, ChevronRight, GraduationCap, LogOut, Sparkles, UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentRequestId, getData, getRequestList, type PlanpickRequest, type StudentInfo } from "@/lib/storage";

function readLocalRequests() {
  try {
    const stored = JSON.parse(localStorage.getItem("planpickRequests") || "[]") as PlanpickRequest[];
    const requests = Array.isArray(stored) ? stored : [];
    const latest = JSON.parse(localStorage.getItem("planpickLatestRequest") || "null") as PlanpickRequest | null;
    if (latest?.id && !requests.some((request) => request.id === latest.id)) requests.push(latest);
    return requests;
  } catch {
    return [];
  }
}

function sortRequests(requests: PlanpickRequest[]) {
  return [...requests].sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
}

export default function MyPage() {
  const user = getCurrentUser();
  const [student, setStudent] = useState<StudentInfo | null>(() => getData<StudentInfo>("planpickStudent"));
  const [requests, setRequests] = useState<PlanpickRequest[]>(() => sortRequests(readLocalRequests()));

  useEffect(() => {
    setStudent(getData<StudentInfo>("planpickStudent"));
    const localRequests = sortRequests(readLocalRequests());
    if (localRequests.length > 0) setRequests(localRequests);

    getRequestList().then((dbRequests) => {
      const merged = new Map<string, PlanpickRequest>();
      localRequests.forEach((request) => merged.set(request.id, request));
      dbRequests.forEach((request) => merged.set(request.id, request));
      setRequests(sortRequests(Array.from(merged.values())));
    });
  }, []);

  const currentRequestId = getCurrentRequestId();
  const latestRequest = requests.find((request) => request.id === currentRequestId) ?? requests[0];
  const profileName = user?.name || user?.userId || "사용자";
  const completionRate = useMemo(() => {
    let score = 30;
    if (student?.school) score += 15;
    if (student?.major) score += 15;
    if (student?.grade) score += 15;
    if (latestRequest) score += 25;
    return Math.min(100, score);
  }, [latestRequest, student]);

  function logout() {
    localStorage.removeItem("planpickUser");
    window.dispatchEvent(new Event("planpick-user-change"));
  }

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#6B5DF6] to-[#4F35D7] p-8 text-white shadow-[0_16px_35px_rgba(91,63,232,0.22)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 shadow-inner">
                <UserRound className="h-10 w-10" />
              </div>
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  PlanPick Profile
                </p>
                <h1 className="text-4xl font-black">{profileName}님</h1>
                <p className="mt-2 text-sm font-bold text-white/70">{student?.school || "학교 미입력"} · {student?.major || "학과 미입력"}</p>
              </div>
            </div>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-white/25">
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-4">
          <SummaryCard icon={<GraduationCap className="h-6 w-6" />} label="학년" value={student?.grade || "미입력"} />
          <SummaryCard icon={<CalendarCheck className="h-6 w-6" />} label="목표 학점" value={student ? `${student.targetCredit}학점` : "미입력"} />
          <SummaryCard icon={<BookOpenCheck className="h-6 w-6" />} label="요청 횟수" value={`${requests.length}회`} />
          <SummaryCard icon={<BadgeCheck className="h-6 w-6" />} label="프로필 완성도" value={`${completionRate}%`} />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950">내 기본 정보</h2>
              <Link href="/request">
                <span className="cursor-pointer rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-[#6B5DF6]">수정하기</span>
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <InfoRow label="학교" value={student?.school || "아직 입력되지 않았어요"} />
              <InfoRow label="학과" value={student?.major || "아직 입력되지 않았어요"} />
              <InfoRow label="학번" value={student?.studentNumber || "아직 입력되지 않았어요"} />
              <InfoRow label="학년" value={student?.grade || "아직 입력되지 않았어요"} />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <h2 className="mb-5 text-xl font-black text-slate-950">최근 시간표 요청</h2>
            {latestRequest ? (
              <div className="rounded-2xl bg-[#FAFAFF] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-[#6B5DF6]">{latestRequest.status === "complete" ? "완료" : "대기중"}</span>
                  <span className="text-xs font-bold text-slate-400">{new Date(latestRequest.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="line-clamp-3 text-sm font-bold leading-relaxed text-slate-600">{latestRequest.needText || "조건 입력 없음"}</p>
                <Link href="/results">
                  <span className="mt-4 inline-flex cursor-pointer items-center gap-1 text-sm font-black text-[#6B5DF6]">
                    결과 보기 <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#FAFAFF] p-5 text-sm font-bold leading-relaxed text-slate-500">
                아직 시간표 추천 요청이 없어요. 기본 정보를 입력하고 AI 시간표를 받아보세요.
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <QuickLink href="/scholarships" icon={<Award className="h-6 w-6" />} title="장학금 추천" text="신청 가능한 장학금을 확인해요." />
          <QuickLink href="/certifications" icon={<BadgeCheck className="h-6 w-6" />} title="자격증 로드맵" text="전공에 맞는 자격증을 준비해요." />
          <QuickLink href="/contests/waiting" icon={<Sparkles className="h-6 w-6" />} title="공모전 추천" text="AI가 맞춤 공모전을 찾아줘요." />
        </section>
      </div>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#FAFAFF] px-4 py-3">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function QuickLink({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href}>
      <div className="group cursor-pointer rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100 transition-transform hover:-translate-y-1">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#6B5DF6] group-hover:bg-[#6B5DF6] group-hover:text-white">{icon}</div>
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <p className="mt-2 text-sm font-bold text-slate-400">{text}</p>
      </div>
    </Link>
  );
}
