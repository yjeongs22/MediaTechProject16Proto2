import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { LogIn, UserPlus } from "lucide-react";
import { useLocation } from "wouter";

type StoredUser = {
  userId: string;
  name: string;
  passwordHash: string;
  createdAt?: number;
};

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function readLocalUsers(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem("planpickUsers") || "{}");
  } catch {
    return {};
  }
}

function writeLocalUser(user: StoredUser) {
  const users = readLocalUsers();
  users[user.userId] = user;
  localStorage.setItem("planpickUsers", JSON.stringify(users));
  localStorage.setItem("planpickUser", JSON.stringify({ userId: user.userId, name: user.name }));
  window.dispatchEvent(new Event("planpick-user-change"));
}

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = userId.trim();
    const cleanName = name.trim();

    if (!id || !password || (mode === "signup" && !cleanName)) {
      setMessage(mode === "signup" ? "이름, 아이디, 비밀번호를 입력해 주세요." : "아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setMessage("");

    const passwordHash = await hashPassword(password);
    const userRef = doc(db, "planpickMvp", "users");

    try {
      const snap = await getDoc(userRef);
      const users = (snap.exists() && typeof snap.data().users === "object" ? snap.data().users : {}) as Record<string, StoredUser>;

      if (mode === "signup") {
        if (users[id]) {
          setMessage("이미 사용 중인 아이디입니다.");
          return;
        }

        const user: StoredUser = { userId: id, name: cleanName, passwordHash, createdAt: Date.now() };
        await setDoc(userRef, { users: { ...users, [id]: user }, updatedAt: serverTimestamp() }, { merge: true });
        writeLocalUser(user);
        setMessage("회원가입이 완료되었습니다. 오른쪽 프로필에 이름이 표시돼요.");
        setMode("login");
      } else {
        const user = users[id];
        if (!user || user.passwordHash !== passwordHash) {
          setMessage("아이디 또는 비밀번호가 맞지 않습니다.");
          return;
        }
        writeLocalUser(user);
        setMessage("로그인되었습니다.");
        setLocation("/");
      }
    } catch {
      if (mode === "signup") {
        const user: StoredUser = { userId: id, name: cleanName, passwordHash, createdAt: Date.now() };
        writeLocalUser(user);
        setMessage("Firebase 권한 문제로 로컬에 백업 저장했어요. Firestore 규칙을 확인해 주세요.");
      } else {
        const user = readLocalUsers()[id];
        if (user?.passwordHash === passwordHash) {
          writeLocalUser(user);
          setMessage("로그인되었습니다. Firebase 권한 문제로 로컬 백업을 사용했어요.");
          setLocation("/");
        } else {
          setMessage("아이디 또는 비밀번호가 맞지 않습니다.");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[#F4F2FF] px-6 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_16px_40px_rgba(48,43,99,0.1)] ring-1 ring-slate-100">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            {mode === "login" ? <LogIn className="h-7 w-7" /> : <UserPlus className="h-7 w-7" />}
          </div>
          <h1 className="text-3xl font-black text-slate-950">{mode === "login" ? "로그인" : "회원가입"}</h1>
          <p className="mt-2 text-sm font-bold text-slate-400">
            {mode === "login" ? "아이디와 비밀번호로 로그인해요." : "이름, 아이디, 비밀번호를 입력해 주세요."}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-xl py-2 text-sm font-black transition-colors ${mode === "login" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-xl py-2 text-sm font-black transition-colors ${mode === "signup" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-2 block text-sm font-black text-slate-800">이름</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                placeholder="이름"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-black text-slate-800">아이디</label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              placeholder="아이디"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-black text-slate-800">비밀번호</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              placeholder="비밀번호"
            />
          </div>

          {message && <p className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-600">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "처리 중..." : mode === "login" ? "로그인하기" : "회원가입하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
