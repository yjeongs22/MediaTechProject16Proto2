import { getDataAsync } from "./storage";

export interface Course {
  id: string;
  name: string;
  type: string;
  day: string;
  start: string;
  end: string;
  credit: number;
  difficulty: string;
  team: string;
  courseCode: string;
  room: string;
  review: string;
  syllabus: string;
  color: string;
}

export const defaultCourses: Course[] = [
  {
    id: "data-structure",
    name: "자료구조",
    type: "전공필수",
    day: "월",
    start: "10:00",
    end: "12:00",
    credit: 3,
    difficulty: "높음",
    team: "없음",
    courseCode: "CS201",
    room: "공학관 302호",
    review: "과제는 많지만 전공 기초를 잡기 좋다는 평가가 많습니다.",
    syllabus: "스택, 큐, 리스트, 트리, 그래프 등 기본 자료구조와 알고리즘 기초를 학습합니다.",
    color: "#C4B5FD",
  },
  {
    id: "computer-arch",
    name: "컴퓨터구조",
    type: "전공필수",
    day: "월",
    start: "14:00",
    end: "16:00",
    credit: 3,
    difficulty: "높음",
    team: "없음",
    courseCode: "CS204",
    room: "공학관 405호",
    review: "개념 이해가 중요하고 시험 범위가 넓다는 평가가 있습니다.",
    syllabus: "CPU 구조, 명령어 집합, 메모리 계층, 파이프라이닝 등 컴퓨터 시스템 구조를 다룹니다.",
    color: "#C4B5FD",
  },
  {
    id: "web-programming",
    name: "웹프로그래밍",
    type: "전공선택",
    day: "수",
    start: "13:00",
    end: "15:00",
    credit: 3,
    difficulty: "중간",
    team: "있음",
    courseCode: "CS305",
    room: "실습실 210호",
    review: "실습 중심이라 결과물이 남고 프로젝트 경험에 유익합니다.",
    syllabus: "HTML, CSS, JavaScript와 웹 서비스 구현 기초를 배우고 간단한 팀 프로젝트를 제작합니다.",
    color: "#DDD6FE",
  },
  {
    id: "database",
    name: "데이터베이스",
    type: "전공선택",
    day: "화",
    start: "10:00",
    end: "12:00",
    credit: 3,
    difficulty: "중간",
    team: "있음",
    courseCode: "CS303",
    room: "공학관 302호",
    review: "SQL 실습이 많고 프로젝트는 취업 준비에 유용합니다.",
    syllabus: "관계형 데이터베이스, SQL, 정규화, 트랜잭션, 데이터 모델링을 학습합니다.",
    color: "#C9F4B5",
  },
  {
    id: "english",
    name: "교양영어",
    type: "교양필수",
    day: "화",
    start: "16:00",
    end: "17:00",
    credit: 2,
    difficulty: "낮음",
    team: "없음",
    courseCode: "GE101",
    room: "교양관 103호",
    review: "부담은 적지만 출석과 발표 준비가 중요합니다.",
    syllabus: "기초 영어 읽기, 말하기, 발표를 중심으로 대학 교양 영어 역량을 기릅니다.",
    color: "#FADDDD",
  },
  {
    id: "creative",
    name: "창의적사고",
    type: "교양선택",
    day: "금",
    start: "13:00",
    end: "15:00",
    credit: 2,
    difficulty: "낮음",
    team: "있음",
    courseCode: "GE220",
    room: "교양관 205호",
    review: "팀 발표가 있지만 학점 부담은 낮은 편입니다.",
    syllabus: "문제 해결, 아이디어 발상, 팀 기반 발표 활동을 통해 창의적 사고 과정을 익힙니다.",
    color: "#FDE68A",
  },
  {
    id: "ai-basic",
    name: "AI기초",
    type: "전공선택",
    day: "수",
    start: "09:00",
    end: "11:00",
    credit: 3,
    difficulty: "중간",
    team: "없음",
    courseCode: "CS250",
    room: "AI통합관 301호",
    review: "최근 관심도가 높은 과목이며 수학 기초가 있으면 따라가기 좋습니다.",
    syllabus: "인공지능 개념, 머신러닝 기초, 데이터 학습 과정, 간단한 모델 사용 예시를 다룹니다.",
    color: "#DDD6FE",
  },
];

function value(raw: Partial<Course> & Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const item = raw[key];
    if (typeof item === "string" && item.trim()) return item.trim();
    if (typeof item === "number") return String(item);
  }
  return fallback;
}

function normalizeCourse(raw: Partial<Course> & Record<string, unknown>, index: number): Course {
  const fallback = defaultCourses[index % defaultCourses.length];
  return {
    ...fallback,
    ...raw,
    id: value(raw, ["id", "courseId", "courseCode", "code"], fallback.id || `course-${index}`),
    name: value(raw, ["name", "title", "courseName", "subjectName", "과목명"], fallback.name),
    type: value(raw, ["type", "category", "courseType", "이수구분"], fallback.type),
    day: value(raw, ["day", "weekday", "요일"], fallback.day).slice(0, 1),
    start: value(raw, ["start", "startTime", "시작시간"], fallback.start),
    end: value(raw, ["end", "endTime", "종료시간"], fallback.end),
    credit: Number(raw.credit || raw["학점"] || fallback.credit || 0),
    difficulty: value(raw, ["difficulty", "난이도"], fallback.difficulty),
    team: value(raw, ["team", "teamProject", "팀플"], fallback.team),
    courseCode: value(raw, ["courseCode", "code", "subjectCode", "과목코드"], fallback.courseCode),
    room: value(raw, ["room", "classroom", "location", "강의실"], fallback.room),
    review: value(raw, ["review", "reviews", "lectureReview", "강의평"], fallback.review),
    syllabus: value(raw, ["syllabus", "plan", "lecturePlan", "강의계획서"], fallback.syllabus),
    color: value(raw, ["color"], fallback.color || "#C4B5FD"),
  };
}

export function getCourses(): Course[] {
  try {
    const stored = localStorage.getItem("planpickCourses");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed.map(normalizeCourse);
    }
  } catch {
    // Use defaults below.
  }
  return defaultCourses;
}

export async function getCoursesAsync(): Promise<Course[]> {
  const dbCourses = await getDataAsync<(Partial<Course> & Record<string, unknown>)[]>("planpickCourses");
  if (Array.isArray(dbCourses) && dbCourses.length > 0) {
    const normalized = dbCourses.map(normalizeCourse);
    localStorage.setItem("planpickCourses", JSON.stringify(normalized));
    return normalized;
  }
  return getCourses();
}

export function saveCourses(courses: Course[]) {
  localStorage.setItem("planpickCourses", JSON.stringify(courses));
}
