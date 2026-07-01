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

type Raw = Record<string, unknown>;

const STORAGE_KEY = "planpickContests";
const REQUEST_STORAGE_KEY = "planpickContestRequests";
const STORAGE_BUCKET = "planpick-3d8ed.firebasestorage.app";

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

function textFromValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const raw = value as Raw;
    return firstText(raw, ["url", "href", "src", "downloadURL", "downloadUrl", "path", "fullPath", "link"], "");
  }
  return "";
}

function firstText(raw: Raw, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = textFromValue(raw[key]);
    if (value) return value;
  }
  return fallback;
}

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("%2F");
}

function normalizeUrl(value: string) {
  const url = value.trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:image/")) return url;
  if (url.startsWith("gs://")) {
    const withoutScheme = url.slice(5);
    const slashIndex = withoutScheme.indexOf("/");
    if (slashIndex < 0) return url;
    const bucket = withoutScheme.slice(0, slashIndex);
    const path = withoutScheme.slice(slashIndex + 1);
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeStoragePath(path)}?alt=media`;
  }
  if (/\.(png|jpe?g|webp|gif)$/i.test(url) || url.includes("/")) {
    return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeStoragePath(url)}?alt=media`;
  }
  return url;
}

function firstMedia(raw: Raw) {
  const direct = firstText(raw, [
    "poster",
    "posterUrl",
    "posterURL",
    "posterImage",
    "posterImageUrl",
    "image",
    "imageUrl",
    "imageURL",
    "thumbnail",
    "thumbnailUrl",
    "thumbnailURL",
    "photoUrl",
    "fileUrl",
    "downloadURL",
    "downloadUrl",
    "storageUrl",
    "storagePath",
    "posterPath",
    "imagePath",
    "포스터",
  ]);
  if (direct) return normalizeUrl(direct);

  for (const key of ["images", "imageUrls", "posters", "posterUrls", "files", "attachments"]) {
    const value = raw[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        const text = textFromValue(item);
        if (text) return normalizeUrl(text);
      }
    }
  }
  return "";
}

function normalizeLinks(raw: Raw): ContestLink[] {
  const output: ContestLink[] = [];
  const value = raw.links || raw.link || raw.urls || raw.linkList || raw.homepages || raw.buttons;

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === "string") output.push({ label: `링크 ${index + 1}`, href: normalizeUrl(item) });
      if (item && typeof item === "object") {
        const link = item as Raw;
        output.push({
          label: firstText(link, ["label", "name", "title", "text"], `링크 ${index + 1}`),
          href: normalizeUrl(firstText(link, ["href", "url", "link", "src"], "")),
        });
      }
    });
  } else if (value && typeof value === "object") {
    const linkMap = value as Raw;
    Object.entries(linkMap).forEach(([label, href], index) => {
      const link = textFromValue(href);
      if (link) output.push({ label: label || `링크 ${index + 1}`, href: normalizeUrl(link) });
    });
  }

  const directLinks = [
    { label: firstText(raw, ["link1Label", "url1Label"], "링크 1"), href: firstText(raw, ["link1", "url1", "homepage", "siteUrl", "site", "website"], "") },
    { label: firstText(raw, ["link2Label", "url2Label"], "링크 2"), href: firstText(raw, ["link2", "url2", "applyUrl", "applicationUrl", "applicationLink"], "") },
    { label: firstText(raw, ["link3Label", "url3Label"], "링크 3"), href: firstText(raw, ["link3", "url3", "detailUrl", "detailLink", "noticeUrl"], "") },
  ];
  directLinks.forEach((link) => {
    if (link.href) output.push({ ...link, href: normalizeUrl(link.href) });
  });

  return output.filter((link) => link.href).slice(0, 3);
}

function normalizeContest(raw: Raw, fallbackId: string): ContestInfo {
  return {
    id: firstText(raw, ["id", "contestId"], fallbackId),
    name: firstText(raw, ["name", "title", "contestName", "competitionName", "공모전이름"], "이름 없는 공모전"),
    date: firstText(raw, ["date", "period", "applicationDate", "applicationPeriod", "deadline", "dueDate", "startDate", "endDate", "신청날짜"], "일정 미정"),
    reason: firstText(raw, ["reason", "aiReason", "recommendReason", "recommendationReason", "description", "summary", "추천이유"], "AI 추천 이유가 아직 등록되지 않았어요."),
    poster: firstMedia(raw),
    links: normalizeLinks(raw),
  };
}

function extractContestDocs(data: Raw, fallbackId: string) {
  for (const key of ["items", "contests", "list", "data", "results"]) {
    const value = data[key];
    if (Array.isArray(value)) {
      return value.map((item, index) => normalizeContest((item || {}) as Raw, `${fallbackId}-${index}`));
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
      const items = extractContestDocs(snap.data() as Raw, "legacy-contest");
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
