import { db } from "./firebase";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

export interface ContestLink {
  label: string;
  href: string;
}

export interface ContestInfo {
  id: string;
  name: string;
  date: string;
  reason: string;
  poster: string;
  links: ContestLink[];
}

export interface ContestRequest {
  id: string;
  text: string;
  createdAt: number;
  status: "pending" | "complete";
}

const STORAGE_KEY = "planpickContests";
const REQUEST_STORAGE_KEY = "planpickContestRequests";

const DEFAULT_CONTESTS: ContestInfo[] = [
  {
    id: "contest-ai-service",
    name: "대학생 AI 서비스 기획 공모전",
    date: "2026.07.01 - 2026.08.12",
    reason: "PlanPick의 시간표 추천 경험을 공모전 아이디어로 확장하기 좋아요.",
    poster: "",
    links: [
      { label: "공모전 보기", href: "https://www.wevity.com/" },
      { label: "아이디어 참고", href: "https://www.thinkcontest.com/" },
      { label: "지원 준비", href: "https://www.all-con.co.kr/" },
    ],
  },
  {
    id: "contest-public-data",
    name: "공공데이터 활용 창업 경진대회",
    date: "2026.07.15 - 2026.09.02",
    reason: "학교, 지역, 진로 데이터를 묶어 학생 맞춤 추천 서비스로 발전시키기 좋아요.",
    poster: "",
    links: [
      { label: "공공데이터", href: "https://www.data.go.kr/" },
      { label: "공모전 검색", href: "https://www.wevity.com/" },
      { label: "팀 빌딩", href: "https://www.thinkcontest.com/" },
    ],
  },
  {
    id: "contest-career",
    name: "청년 진로 포트폴리오 챌린지",
    date: "2026.08.01 - 2026.09.20",
    reason: "수강 계획, 자격증, 채용 정보를 한 화면에 모으는 PlanPick 방향성과 잘 맞아요.",
    poster: "",
    links: [
      { label: "공모전 모음", href: "https://www.all-con.co.kr/" },
      { label: "포스터 보기", href: "https://www.wevity.com/" },
      { label: "신청 가이드", href: "https://www.thinkcontest.com/" },
    ],
  },
];

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeContest(raw: Partial<ContestInfo> & { id?: string }, fallbackId: string): ContestInfo {
  const links = Array.isArray(raw.links) ? raw.links : [];
  return {
    id: raw.id || fallbackId,
    name: raw.name || "이름 없는 공모전",
    date: raw.date || "일정 미정",
    reason: raw.reason || "관리자 페이지에서 AI 추천 이유를 입력해 주세요.",
    poster: raw.poster || "",
    links: [
      links[0] || { label: "링크 1", href: "" },
      links[1] || { label: "링크 2", href: "" },
      links[2] || { label: "링크 3", href: "" },
    ],
  };
}

export async function getContests(): Promise<ContestInfo[]> {
  try {
    const collectionSnap = await getDocs(collection(db, "contests"));
    const collectionItems = collectionSnap.docs.map((snap) => normalizeContest({ id: snap.id, ...snap.data() }, snap.id));
    if (collectionItems.length > 0) {
      writeLocal(STORAGE_KEY, collectionItems);
      return collectionItems;
    }
  } catch {
    // Use legacy document or local backup when Firestore is unavailable.
  }

  try {
    const snap = await getDoc(doc(db, "planpickMvp", "contests"));
    if (snap.exists() && Array.isArray(snap.data().items)) {
      const items = snap.data().items.map((item: Partial<ContestInfo>, index: number) => normalizeContest(item, `contest-${index}`));
      writeLocal(STORAGE_KEY, items);
      return items;
    }
  } catch {
    // Local fallback below.
  }

  return readLocal(STORAGE_KEY, DEFAULT_CONTESTS);
}

export async function saveContests(contests: ContestInfo[]) {
  writeLocal(STORAGE_KEY, contests);
  await setDoc(doc(db, "planpickMvp", "contests"), { items: contests }, { merge: true });
  await Promise.all(contests.map((contest) => setDoc(doc(db, "contests", contest.id), contest, { merge: true })));
}

export async function getContestRequests(): Promise<ContestRequest[]> {
  try {
    const snap = await getDoc(doc(db, "planpickMvp", "contestRequests"));
    if (snap.exists() && Array.isArray(snap.data().items)) {
      const items = snap.data().items as ContestRequest[];
      writeLocal(REQUEST_STORAGE_KEY, items);
      return items;
    }
  } catch {
    // Local fallback below.
  }

  return readLocal(REQUEST_STORAGE_KEY, []);
}

export async function addContestRequest(text: string) {
  const request: ContestRequest = {
    id: `contest-request-${Date.now()}`,
    text,
    createdAt: Date.now(),
    status: "pending",
  };
  const list = [request, ...(await getContestRequests())];
  writeLocal(REQUEST_STORAGE_KEY, list);
  await setDoc(doc(db, "planpickMvp", "contestRequests"), { items: list }, { merge: true });
  return request;
}

export function makeBlankContest(): ContestInfo {
  return {
    id: `contest-${Date.now()}`,
    name: "",
    date: "",
    reason: "",
    poster: "",
    links: [
      { label: "링크 1", href: "" },
      { label: "링크 2", href: "" },
      { label: "링크 3", href: "" },
    ],
  };
}
