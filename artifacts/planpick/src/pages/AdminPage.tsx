import React, { useEffect, useState } from "react";
import { getContestRequests, getContests, makeBlankContest, saveContests, type ContestInfo, type ContestRequest } from "@/lib/contests";
import { ImagePlus, Plus, Save, Trash2 } from "lucide-react";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short" }).format(value);
}

export default function AdminPage() {
  const [contests, setContests] = useState<ContestInfo[]>([]);
  const [requests, setRequests] = useState<ContestRequest[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");

  const selected = contests.find((item) => item.id === selectedId) ?? contests[0];

  useEffect(() => {
    getContests().then((items) => {
      setContests(items);
      setSelectedId(items[0]?.id ?? "");
    });
    getContestRequests().then(setRequests);
  }, []);

  function updateSelected(next: ContestInfo) {
    setContests((items) => items.map((item) => (item.id === next.id ? next : item)));
  }

  async function handleSave() {
    try {
      await saveContests(contests);
      setMessage("공모전 정보가 Firebase에 저장되었습니다.");
    } catch {
      localStorage.setItem("planpickContests", JSON.stringify(contests));
      setMessage("Firebase 권한이 막혀 로컬에 저장했어요. Firestore 규칙을 확인해 주세요.");
    }
  }

  function addContest() {
    const contest = makeBlankContest();
    setContests((items) => [...items, contest]);
    setSelectedId(contest.id);
  }

  function removeContest(id: string) {
    const next = contests.filter((item) => item.id !== id);
    setContests(next);
    setSelectedId(next[0]?.id ?? "");
  }

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-8 md:px-10 lg:px-14">
      <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-xl font-black text-slate-900">공모전 Admin</h1>
              <button onClick={addContest} className="rounded-full bg-indigo-600 p-2 text-white">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {contests.map((contest) => (
                <button
                  key={contest.id}
                  onClick={() => setSelectedId(contest.id)}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-black transition-colors ${
                    selected?.id === contest.id ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-indigo-50"
                  }`}
                >
                  {contest.name || "새 공모전"}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <h2 className="mb-3 text-lg font-black text-slate-900">AI 추천 요청</h2>
            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {requests.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-400">아직 요청이 없어요.</p>}
              {requests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-black text-indigo-500">{formatDate(request.createdAt)}</p>
                  <p className="text-sm font-bold leading-relaxed text-slate-600">{request.text}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>

        {selected && (
          <main className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(48,43,99,0.08)] ring-1 ring-slate-100">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-indigo-500">Poster + Contest Info</p>
                <h2 className="text-2xl font-black text-slate-900">공모전 정보 입력</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => removeContest(selected.id)} className="rounded-2xl border border-red-100 px-4 py-2 text-sm font-black text-red-500">
                  <Trash2 className="mr-1 inline h-4 w-4" />
                  삭제
                </button>
                <button onClick={handleSave} className="rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-black text-white">
                  <Save className="mr-1 inline h-4 w-4" />
                  저장
                </button>
              </div>
            </div>

            {message && <p className="mb-4 rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-600">{message}</p>}

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <label className="flex min-h-[360px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-indigo-100 bg-indigo-50 text-center">
                {selected.poster ? (
                  <img src={selected.poster} alt="공모전 포스터" className="h-full w-full object-cover" />
                ) : (
                  <div className="p-6">
                    <ImagePlus className="mx-auto mb-3 h-10 w-10 text-indigo-500" />
                    <p className="font-black text-indigo-600">포스터 이미지 업로드</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    updateSelected({ ...selected, poster: await readFileAsDataUrl(file) });
                  }}
                />
              </label>

              <div className="space-y-4">
                <input
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-indigo-500"
                  placeholder="공모전 이름"
                  value={selected.name}
                  onChange={(e) => updateSelected({ ...selected, name: e.target.value })}
                />
                <input
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-indigo-500"
                  placeholder="신청 날짜"
                  value={selected.date}
                  onChange={(e) => updateSelected({ ...selected, date: e.target.value })}
                />
                <textarea
                  className="h-28 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"
                  placeholder="AI 추천 이유"
                  value={selected.reason}
                  onChange={(e) => updateSelected({ ...selected, reason: e.target.value })}
                />
                {selected.links.map((link, index) => (
                  <div key={index} className="grid gap-2 md:grid-cols-[150px_1fr]">
                    <input
                      className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-indigo-500"
                      value={link.label}
                      onChange={(e) => {
                        const links = [...selected.links];
                        links[index] = { ...link, label: e.target.value };
                        updateSelected({ ...selected, links });
                      }}
                    />
                    <input
                      className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-indigo-500"
                      placeholder="https://..."
                      value={link.href}
                      onChange={(e) => {
                        const links = [...selected.links];
                        links[index] = { ...link, href: e.target.value };
                        updateSelected({ ...selected, links });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
