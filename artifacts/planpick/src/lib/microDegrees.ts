import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db, ensureFirebaseAuth } from "./firebase";

export interface MicroDegreeInfo {
  id: string;
  name: string;
  summary: string;
  reason: string;
  courses: string[];
  universities?: string[];
  area?: string;
  level?: string;
}

type Raw = Record<string, unknown>;

const STORAGE_KEY = "planpickMicroDegrees";

const COLLECTION_NAMES = [
  "mds",
  "md",
  "MD",
  "microDegrees",
  "microdegrees",
  "microDegree",
  "microdegree",
  "micro_degrees",
  "micro_degree",
  "mdRecommendations",
  "microDegreeRecommendations",
  "microdegreeRecommendations",
  "microDegreeRecommends",
  "microMajors",
  "microMajor",
  "majorDegrees",
];

const LEGACY_DOC_IDS = ["mds", "md", "MD", ...COLLECTION_NAMES, "microDegreeList", "mdList"];

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
  if (value && typeof value === "object") {
    const raw = value as Raw;
    return firstText(raw, ["name", "title", "microDegree", "courseName", "value", "text", "label"], "");
  }
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

function isPlainObject(value: unknown): value is Raw {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeMicroDegree(raw: Raw, fallbackId: string): MicroDegreeInfo {
  return {
    id: firstText(raw, ["id", "mdId", "microDegreeId", "microdegreeId"], fallbackId),
    name: firstText(raw, ["name", "title", "microDegree", "mdName", "microDegreeName", "microdegreeName", "마이크로디그리명", "MD명"], "마이크로디그리 추천"),
    summary: firstText(raw, ["summary", "description", "intro", "desc", "competency", "oneLine", "shortDescription", "한줄요약", "요약"], "추천 시간표와 잘 맞는 마이크로디그리입니다."),
    reason: firstText(raw, ["reason", "recommendReason", "aiReason", "recommendationReason", "competency", "area", "추천이유", "추천 이유"], "현재 추천 과목과 연계성이 높아요."),
    courses: textArray(raw, ["courses", "courseNames", "courseName", "subjects", "subjectNames", "recommendedCourses", "classes", "과목", "추천과목"]),
  };
}

function groupMicroDegreeRows(rows: Raw[]): MicroDegreeInfo[] {
  const grouped = new Map<string, Raw[]>();

  rows.forEach((row) => {
    const name = firstText(row, ["microDegree", "name", "title"], "마이크로디그리 추천");
    grouped.set(name, [...(grouped.get(name) || []), row]);
  });

  return Array.from(grouped.entries()).map(([name, items]) => {
    const first = items[0] || {};
    const courses = Array.from(new Set(items.map((item) => firstText(item, ["courseName", "courses", "courseNames"], "")).filter(Boolean)));
    const universities = Array.from(new Set(items.map((item) => firstText(item, ["university"], "")).filter(Boolean)));
    const area = firstText(first, ["area"], "");
    const level = firstText(first, ["level"], "");
    const competency = firstText(first, ["competency", "summary", "description"], "");

    return {
      id: firstText(first, ["id"], name),
      name,
      summary: competency || `${universities.join(", ")} ${area}`.trim() || "추천 시간표와 잘 맞는 마이크로디그리입니다.",
      reason: competency || "현재 추천 과목과 연계성이 높아요.",
      courses,
      universities,
      area,
      level,
    };
  });
}

function extractItems(data: Raw, fallbackId: string) {
  for (const key of ["items", "microDegrees", "microdegrees", "mdRecommendations", "recommendations", "list", "data", "results"]) {
    const value = data[key];
    if (Array.isArray(value)) {
      if (value.some((item) => isPlainObject(item) && typeof item.microDegree === "string")) {
        return groupMicroDegreeRows(value as Raw[]);
      }
      return value.map((item, index) => normalizeMicroDegree((item || {}) as Raw, `${fallbackId}-${index}`));
    }
  }

  const objectItems = Object.entries(data)
    .filter(([key, value]) => key !== "id" && isPlainObject(value))
    .map(([key, value]) => normalizeMicroDegree({ id: key, ...(value as Raw) }, key));

  if (objectItems.length > 0) return objectItems;
  return [normalizeMicroDegree(data, fallbackId)];
}

async function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

function usableItems(items: MicroDegreeInfo[]) {
  return items.filter((item) => item.name && item.name !== "마이크로디그리 추천");
}

export async function getMicroDegrees(): Promise<MicroDegreeInfo[]> {
  void ensureFirebaseAuth();

  for (const docId of LEGACY_DOC_IDS) {
    try {
      const snap = await withTimeout(getDoc(doc(db, "planpickMvp", docId)));
      if (snap.exists()) {
        const items = usableItems(extractItems(snap.data() as Raw, docId));
        if (items.length > 0) {
          writeLocal(STORAGE_KEY, items);
          return items;
        }
      }
    } catch (error) {
      console.warn(`${docId} legacy read failed`, error);
    }
  }

  for (const name of COLLECTION_NAMES) {
    try {
      const snap = await withTimeout(getDocs(collection(db, name)));
      const items = usableItems(snap.docs.flatMap((item) => extractItems({ id: item.id, ...item.data() }, item.id)));
      if (items.length > 0) {
        writeLocal(STORAGE_KEY, items);
        return items;
      }
    } catch (error) {
      console.warn(`${name} collection read failed`, error);
    }
  }

  return readLocal(STORAGE_KEY, DEFAULT_MICRO_DEGREES);
}
