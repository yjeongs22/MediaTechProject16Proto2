import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db, ensureFirebaseAuth } from "./firebase";

export interface MicroDegreeInfo {
  id: string;
  name: string;
  summary: string;
  reason: string;
  courses: string[];
}

type Raw = Record<string, unknown>;

const STORAGE_KEY = "planpickMicroDegrees";
const COLLECTION_NAMES = ["microDegrees", "microdegrees", "mdRecommendations", "microDegreeRecommendations"];
const LEGACY_DOC_IDS = ["microDegrees", "microdegrees", "mdRecommendations"];

const DEFAULT_MICRO_DEGREES: MicroDegreeInfo[] = [
  {
    id: "default-md",
    name: "AI 서비스 기획 마이크로디그리",
    summary: "시간표 추천 결과와 잘 맞는 데이터/AI 기반 역량 트랙입니다.",
    reason: "추천 과목 조합이 데이터 분석과 서비스 기획 역량을 함께 채우기 좋아요.",
    courses: ["자료구조", "데이터베이스", "AI 서비스 기획"],
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
  return "";
}

function firstText(raw: Raw, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = textFromValue(raw[key]);
    if (value) return value;
  }
  return fallback;
}

function textArray(raw: Raw, keys: string[]) {
  for (const key of keys) {
    const value = raw[key];
    if (Array.isArray(value)) {
      return value.map(textFromValue).filter(Boolean);
    }
    const text = textFromValue(value);
    if (text) {
      return text
        .split(/[,/\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function normalizeMicroDegree(raw: Raw, fallbackId: string): MicroDegreeInfo {
  return {
    id: firstText(raw, ["id", "mdId", "microDegreeId"], fallbackId),
    name: firstText(raw, ["name", "title", "mdName", "microDegreeName", "마이크로디그리명", "MD명"], "마이크로디그리 추천"),
    summary: firstText(raw, ["summary", "description", "intro", "desc", "한줄요약", "요약"], "추천 시간표와 잘 맞는 마이크로디그리입니다."),
    reason: firstText(raw, ["reason", "recommendReason", "aiReason", "추천이유", "추천 이유"], "현재 추천 과목과 연계성이 높아요."),
    courses: textArray(raw, ["courses", "courseNames", "subjects", "recommendedCourses", "과목", "추천과목"]),
  };
}

function extractItems(data: Raw, fallbackId: string) {
  for (const key of ["items", "microDegrees", "microdegrees", "mdRecommendations", "list", "data", "results"]) {
    const value = data[key];
    if (Array.isArray(value)) {
      return value.map((item, index) => normalizeMicroDegree((item || {}) as Raw, `${fallbackId}-${index}`));
    }
  }
  return [normalizeMicroDegree(data, fallbackId)];
}

export async function getMicroDegrees(): Promise<MicroDegreeInfo[]> {
  for (const name of COLLECTION_NAMES) {
    try {
      await ensureFirebaseAuth();
      const snap = await getDocs(collection(db, name));
      const items = snap.docs.flatMap((item) => extractItems({ id: item.id, ...item.data() }, item.id));
      if (items.length > 0) {
        writeLocal(STORAGE_KEY, items);
        return items;
      }
    } catch (error) {
      console.warn(`${name} collection read failed`, error);
    }
  }

  for (const docId of LEGACY_DOC_IDS) {
    try {
      await ensureFirebaseAuth();
      const snap = await getDoc(doc(db, "planpickMvp", docId));
      if (snap.exists()) {
        const items = extractItems(snap.data() as Raw, docId);
        if (items.length > 0) {
          writeLocal(STORAGE_KEY, items);
          return items;
        }
      }
    } catch (error) {
      console.warn(`${docId} legacy read failed`, error);
    }
  }

  return readLocal(STORAGE_KEY, DEFAULT_MICRO_DEGREES);
}
