import { db, ensureFirebaseAuth } from "./firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

const COLLECTION = "planpickMvp";

const DOC_MAP: Record<string, string> = {
  planpickStudent: "student",
  planpickRequest: "request",
  planpickRequests: "requests",
  planpickCourses: "courses",
};

function getData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setData<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function packValue(key: string, value: unknown) {
  if (key === "planpickCourses" || key === "planpickRequests") {
    return { items: value ?? [] };
  }
  return value ?? {};
}

function unpackValue<T>(key: string, value: Record<string, unknown> | null): T | null {
  if (!value) return null;
  if (key === "planpickCourses" || key === "planpickRequests") {
    return (Array.isArray(value.items) ? value.items : null) as T | null;
  }
  return value as T;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

export async function getDataAsync<T>(key: string): Promise<T | null> {
  const docId = DOC_MAP[key];
  if (!docId) return getData<T>(key);

  try {
    await ensureFirebaseAuth();
    const ref = doc(db, COLLECTION, docId);
    const snap = await withTimeout(getDoc(ref), 5000);
    if (!snap.exists()) return getData<T>(key);
    const value = unpackValue<T>(key, snap.data() as Record<string, unknown>);
    if (value !== null) setData(key, value);
    return value;
  } catch {
    return getData<T>(key);
  }
}

export async function setDataAsync<T>(key: string, value: T): Promise<void> {
  setData(key, value);
  const docId = DOC_MAP[key];
  if (!docId) return;

  try {
    await ensureFirebaseAuth();
    const ref = doc(db, COLLECTION, docId);
    await withTimeout(setDoc(ref, packValue(key, value)), 5000);
  } catch {
    // silently fall back to localStorage only
  }
}

export async function removeDataAsync(key: string): Promise<void> {
  localStorage.removeItem(key);
  const docId = DOC_MAP[key];
  if (!docId) return;

  try {
    await ensureFirebaseAuth();
    const ref = doc(db, COLLECTION, docId);
    await withTimeout(deleteDoc(ref), 5000);
  } catch {}
}

export { getData, setData };

export interface StudentInfo {
  school: string;
  major: string;
  studentNumber: string;
  grade: string;
  targetCredit: number;
}

export interface PlanpickRequest {
  id: string;
  student: StudentInfo;
  needText: string;
  status: "pending" | "complete" | "완료";
  createdAt: number;
  result?: PlanResult;
}

export interface PlanResult {
  plan1: PlanData;
  plan2: PlanData;
  plan3: PlanData;
  planB: string;
  priorities: string[];
}

export interface PlanData {
  label: string;
  courseIds: string[];
  pros: string;
  cons: string;
}

export function getCurrentRequestId(): string | null {
  return localStorage.getItem("planpickCurrentRequestId");
}

export function setCurrentRequestId(id: string) {
  localStorage.setItem("planpickCurrentRequestId", id);
}

export async function getRequestList(): Promise<PlanpickRequest[]> {
  const byId = new Map<string, PlanpickRequest>();

  const legacyList = await getDataAsync<PlanpickRequest[]>("planpickRequests");
  if (Array.isArray(legacyList)) {
    legacyList.forEach((request) => byId.set(request.id, request));
  }

  try {
    await ensureFirebaseAuth();
    const snap = await withTimeout(getDocs(collection(db, "requests")), 5000);
    snap.docs.forEach((requestDoc) => {
      const request = { id: requestDoc.id, ...requestDoc.data() } as PlanpickRequest;
      byId.set(request.id, request);
    });
  } catch (error) {
    console.warn("requests collection read failed", error);
  }

  return Array.from(byId.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function upsertRequest(request: PlanpickRequest): Promise<void> {
  setData("planpickLatestRequest", request);
  const list = await getRequestList();
  const idx = list.findIndex((r) => r.id === request.id);
  if (idx >= 0) {
    list[idx] = request;
  } else {
    list.push(request);
  }
  await setDataAsync("planpickRequests", list);

  try {
    await ensureFirebaseAuth();
    await withTimeout(setDoc(doc(db, "requests", request.id), request, { merge: true }), 5000);
  } catch (error) {
    console.warn("request document write failed", error);
  }
}

export async function getRequestById(id: string): Promise<PlanpickRequest | null> {
  try {
    await ensureFirebaseAuth();
    const snap = await withTimeout(getDoc(doc(db, "requests", id)), 5000);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as PlanpickRequest;
    }
  } catch {
    // Legacy/local fallback below.
  }

  const list = await getRequestList();
  return list.find((r) => r.id === id) ?? null;
}
