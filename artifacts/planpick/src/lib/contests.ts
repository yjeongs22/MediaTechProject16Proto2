import { db, ensureFirebaseAuth } from "./firebase";
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

type RawContest = Record<string, unknown>;

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

function firstText(raw: RawContest, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function normalizeLinks(raw: RawContest): ContestLink[] {
  const rawLinks = raw.links || raw.link || raw.urls;
  if (Array.isArray(rawLinks)) {
    const links = rawLinks
      .map((item, index) => {
        if (typeof item === "string") return { label: `링크 ${index + 1}`, href: item };
        if (item && typeof item === "object") {
          const link = item as RawContest;
          return {
            label: firstText(link, ["label", "name", "title"], `링크 ${index + 1}`),
            href: firstText(link, ["href", "url", "link"], ""),
          };
        }
        return null;
      })
      .filter(Boolean) as ContestLink[];
    if (links.length > 0) return links.slice(0, 3);
  }

  return [
    { label: firstText(raw, ["link1Label", "url1Label"], "링크 1"), href: firstText(raw, ["link1", "url1", "homepage", "siteUrl"], "") },
    { label: firstText(raw, ["link2Label", "url2Label"], "링크 2"), href: firstText(raw, ["link2", "url2", "applyUrl"], "") },
    { label: firstText(raw, ["link3Label", "url3Label"], "링크 3"), href: firstText(raw, ["link3", "url3", "detailUrl"], "") },
  ];
}

function normalizeContest(raw: RawContest, fallbackId: string): ContestInfo {
  return {
    id: firstText(raw, ["id", "contestId"], fallbackId),
    name: firstText(raw, ["name", "title", "contestName", "competitionName", "공모전이름"], "이름 없는 공모전"),
    date: firstText(raw, ["date", "period", "applicationDate", "applicationPeriod", "deadline", "dueDate", "신청날짜"], "일정 미정"),
    reason: firstText(raw, ["reason", "aiReason", "recommendReason", "recommendationReason", "description", "추천이유"], "AI 추천 이유가 아직 등록되지 않았어요."),
    poster: firstText(raw, ["poster", "posterUrl", "image", "imageUrl", "thumbnail", "thumbnailUrl", "photoUrl", "포스터"], ""),
    links: normalizeLinks(raw),
  };
}

function extractContestDocs(data: RawContest, fallbackId: string) {
  const arrays = [data.items, data.contests, data.list, data.data];
  for (const value of arrays) {
    if (Array.isArray(value)) {
      return value.map((item, index) => normalizeContest((item || {}) as RawContest, `${fallbackId}-${index}`));
    }
  }
  return [normalizeContest(data, fallbackId)];
}

export async function getContests(): Promise<ContestInfo[]> {
  try {
    await ensureFirebaseAuth();
    const collectionSnap = await getDocs(collection(db, "contests"));
    const collectionItems = collectionSnap.docs.flatMap((snap) => extractContestDocs({ id: snap.id, ...snap.data() }, snap.id));
    const usableItems = collectionItems.filter((item) => item.name && item.name !== "이름 없는 공모전");
    if (usableItems.length > 0) {
      writeLocal(STORAGE_KEY, usableItems);
      return usableItems;
    }
  } catch (error) {
    console.warn("contests collection read failed", error);
  }

  try {
    await ensureFirebaseAuth();
    const snap = await getDoc(doc(db, "planpickMvp", "contests"));
    if (snap.exists()) {
      const items = extractContestDocs(snap.data() as RawContest, "legacy-contest");
      if (items.length > 0) {
        writeLocal(STORAGE_KEY, items);
        return items;
      }
    }
  } catch (error) {
    console.warn("legacy contests read failed", error);
  }

  return readLocal(STORAGE_KEY, DEFAULT_CONTESTS);
}

export async function saveContests(contests: ContestInfo[]) {
  writeLocal(STORAGE_KEY, contests);
  await ensureFirebaseAuth();
  await setDoc(doc(db, "planpickMvp", "contests"), { items: contests }, { merge: true });
  await Promise.all(contests.map((contest) => setDoc(doc(db, "contests", contest.id), contest, { merge: true })));
}

export async function getContestRequests(): Promise<ContestRequest[]> {
  try {
    await ensureFirebaseAuth();
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
  await ensureFirebaseAuth();
  await setDoc(doc(db, "planpickMvp", "contestRequests"), { items: list }, { merge: true });
  return request;
}
