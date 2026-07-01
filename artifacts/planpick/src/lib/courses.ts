import { getDataAsync } from "./storage";

export interface CourseSchedule {
  day: string;
  start: string;
  end: string;
  room?: string;
}

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
  reviewItems: string[];
  reviewSummary: string;
  syllabus: string;
  syllabusImageDataUrl: string;
  schedule: CourseSchedule[];
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
    reviewItems: [
      "과제는 많지만 전공 기초를 잡기 좋다는 평가가 많습니다.",
      "수업 흐름과 과제량을 미리 확인하고 들어가면 따라가기 좋습니다.",
      "출석, 과제, 시험 준비를 꾸준히 챙기는 학생에게 추천합니다.",
    ],
    reviewSummary: "난이도는 있지만 전공 이해도 향상에 도움이 되는 과목입니다.",
    syllabus: "스택, 큐, 리스트, 트리, 그래프 등 기본 자료구조와 알고리즘 기초를 학습합니다.",
    syllabusImageDataUrl: "",
    schedule: [{ day: "월", start: "10:00", end: "12:00", room: "공학관 302호" }],
    color: "#C4B5FD",
  },
  {
    id: "database",
    name: "데이터베이스",
    type: "전공필수",
    day: "금",
    start: "09:00",
    end: "11:50",
    credit: 3,
    difficulty: "중간",
    team: "없음",
    courseCode: "NIB12394-22",
    room: "J303호",
    review: "SQL 실습과 이론을 함께 다루는 실용적인 과목입니다.",
    reviewItems: [
      "SQL 실습과 이론을 함께 다루는 실용적인 과목입니다.",
      "수업만 잘 따라가면 과제와 시험은 무난하다는 평가가 있습니다.",
      "꾸준히 공부하지 않으면 좋은 성적을 받기 어려울 수 있습니다.",
    ],
    reviewSummary: "이론과 실습을 균형 있게 진행하며 꾸준한 복습이 중요한 과목입니다.",
    syllabus: "관계형 데이터베이스, SQL, 정규화, 트랜잭션, 데이터 모델링을 학습합니다.",
    syllabusImageDataUrl: "",
    schedule: [{ day: "금", start: "09:00", end: "11:50", room: "J303호" }],
    color: "#C9F4B5",
  },
];

type RawCourse = Partial<Course> & Record<string, unknown>;

function textValue(raw: RawCourse, keys: string[], fallback = "") {
  for (const key of keys) {
    const item = raw[key];
    if (typeof item === "string" && item.trim()) return item.trim();
    if (typeof item === "number") return String(item);
  }
  return fallback;
}

function textArray(raw: RawCourse, keys: string[], fallback: string[]) {
  for (const key of keys) {
    const item = raw[key];
    if (Array.isArray(item)) {
      const values = item
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean);
      if (values.length > 0) return values;
    }
  }
  return fallback;
}

function normalizeSchedule(raw: RawCourse, fallback: Course): CourseSchedule[] {
  const value = raw.schedule;
  if (Array.isArray(value)) {
    const schedules = value
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const schedule = item as unknown as Record<string, unknown>;
        const day = String(schedule.day || schedule.weekday || schedule["요일"] || "").trim();
        const start = String(schedule.start || schedule.startTime || schedule["시작시간"] || "").trim();
        const end = String(schedule.end || schedule.endTime || schedule["종료시간"] || "").trim();
        const room = String(schedule.room || schedule.classroom || schedule.location || schedule["강의실"] || raw.room || "").trim();
        if (!day || !start || !end) return null;
        return { day: day.slice(0, 1), start, end, room };
      })
      .filter(Boolean) as CourseSchedule[];
    if (schedules.length > 0) return schedules;
  }

  const day = textValue(raw, ["day", "weekday", "요일"], fallback.day).slice(0, 1);
  const start = textValue(raw, ["start", "startTime", "시작시간"], fallback.start);
  const end = textValue(raw, ["end", "endTime", "종료시간"], fallback.end);
  const room = textValue(raw, ["room", "classroom", "location", "강의실"], fallback.room);
  return [{ day, start, end, room }];
}

function normalizeCourse(raw: RawCourse, index: number): Course {
  const fallback = defaultCourses[index % defaultCourses.length];
  const review = textValue(raw, ["review", "reviews", "lectureReview", "강의평"], fallback.review);
  const reviewItems = textArray(raw, ["reviewItems", "reviewList", "reviewsList"], fallback.reviewItems || [review]).slice(0, 3);
  const schedule = normalizeSchedule(raw, fallback);
  const firstSchedule = schedule[0] || fallback.schedule[0];

  return {
    ...fallback,
    ...raw,
    id: textValue(raw, ["id", "courseId", "courseCode", "code"], fallback.id || `course-${index}`),
    name: textValue(raw, ["name", "title", "courseName", "subjectName", "과목명"], fallback.name),
    type: textValue(raw, ["type", "category", "courseType", "이수구분"], fallback.type),
    day: firstSchedule.day,
    start: firstSchedule.start,
    end: firstSchedule.end,
    credit: Number(raw.credit || raw["학점"] || fallback.credit || 0),
    difficulty: textValue(raw, ["difficulty", "난이도"], fallback.difficulty),
    team: textValue(raw, ["team", "teamProject", "팀플"], fallback.team),
    courseCode: textValue(raw, ["courseCode", "code", "subjectCode", "과목코드"], fallback.courseCode),
    room: firstSchedule.room || textValue(raw, ["room", "classroom", "location", "강의실"], fallback.room),
    review,
    reviewItems,
    reviewSummary: textValue(raw, ["reviewSummary", "summary", "oneLineSummary", "한줄요약"], fallback.reviewSummary),
    syllabus: textValue(raw, ["syllabus", "plan", "lecturePlan", "강의계획서"], fallback.syllabus),
    syllabusImageDataUrl: textValue(raw, ["syllabusImageDataUrl", "syllabusImage", "syllabusImageUrl", "planImageDataUrl"], fallback.syllabusImageDataUrl),
    schedule,
    color: textValue(raw, ["color"], fallback.color || "#C4B5FD"),
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
  const dbCourses = await getDataAsync<RawCourse[]>("planpickCourses");
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
