import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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

const STORAGE_KEY = "planpickContests";
const DEFAULT_CONTESTS: ContestInfo[] = [
  {
    id: "contest-ai-service",
    name: "대학생 AI 서비스 기획 공모전",
    date: "2026.07.01 - 2026.08.12",
    reason: "PlanPick 전공/시간표 데이터와 연결해 AI 추천 서비스 아이디어를 확장하기 좋아요.",
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
    reason: "학교·지역·채용 데이터를 묶어 학생 맞춤 추천 서비스로 발전시키기 좋아요.",
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

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ContestInfo[]) : DEFAULT_CONTESTS;
  } catch {
    return DEFAULT_CONTESTS;
  }
}

function writeLocal(contests: ContestInfo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contests));
}

export async function getContests(): Promise<ContestInfo[]> {
  try {
    const snap = await getDoc(doc(db, "planpickMvp", "contests"));
    if (!snap.exists()) return readLocal();
    const items = snap.data().items;
    if (!Array.isArray(items)) return readLocal();
    writeLocal(items as ContestInfo[]);
    return items as ContestInfo[];
  } catch {
    return readLocal();
  }
}

export async function saveContests(contests: ContestInfo[]) {
  writeLocal(contests);
  await setDoc(doc(db, "planpickMvp", "contests"), { items: contests });
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
