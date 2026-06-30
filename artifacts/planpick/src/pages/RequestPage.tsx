import React, { useRef, useState } from "react";
import { useLocation } from "wouter";
import { setCurrentRequestId, setData, type StudentInfo } from "@/lib/storage";
import { ArrowLeft, ImagePlus, X } from "lucide-react";

const gradeOptions = ["1학년", "2학년", "3학년", "4학년", "졸업유예"];

export default function RequestPage() {
  const [, setLocation] = useLocation();
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [grade, setGrade] = useState("");
  const [targetCredit, setTargetCredit] = useState(18);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timetableImages, setTimetableImages] = useState<string[]>([]);
  const [imageStatus, setImageStatus] = useState<"idle" | "analyzing" | "complete">("idle");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rangeProgress = `${((targetCredit - 1) / 20) * 100}%`;

  function handleImageFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    setImageStatus("analyzing");
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => setTimetableImages((prev) => [...prev, String(event.target?.result || "")]);
      reader.readAsDataURL(file);
    });
    window.setTimeout(() => setImageStatus("complete"), 5000);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleImageFiles(e.dataTransfer.files);
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!school.trim()) nextErrors.school = "학교를 입력해 주세요.";
    if (!major.trim()) nextErrors.major = "학과를 입력해 주세요.";
    if (!grade.trim()) nextErrors.grade = "학년을 선택해 주세요.";
    return nextErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const student: StudentInfo = {
      school,
      major,
      studentNumber,
      grade,
      targetCredit,
    };

    setData("planpickStudent", student);
    setCurrentRequestId(String(Date.now()));
    setLocation("/request/needs");
  }

  const inputClass =
    "h-10 w-full rounded-xl border border-[#D8D8E0] bg-white px-3.5 text-[13px] font-bold text-slate-900 outline-none transition-all placeholder:text-[#A1A5B4] focus:border-[#6D5DF4] focus:ring-4 focus:ring-[#6D5DF4]/10";
  const errorInputClass = "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100";

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-6 md:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-[980px]">
        <div className="mb-5 flex items-center gap-5">
          <button
            type="button"
            onClick={() => setLocation("/")}
            data-testid="btn-back-home"
            className="flex h-10 items-center gap-1.5 rounded-2xl bg-[#ECE9FA] px-3.5 text-[14px] font-black text-slate-900 transition-colors hover:bg-[#E4DFFA]"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로
          </button>
          <h2 className="text-[24px] font-black text-[#6B5DF6]">기본 정보 입력</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[24px] bg-white/92 px-7 py-8 shadow-[0_14px_35px_rgba(42,33,95,0.08)] ring-1 ring-[#ECEAF5] backdrop-blur md:px-9"
        >
          <div className="mb-8">
            <h1 className="text-[36px] font-black leading-tight text-black md:text-[42px]">기본 정보 입력</h1>
            <p className="mt-4 text-[16px] font-bold text-[#9296A5] md:text-[17px]">
              학교와 학과 정보를 입력하면 AI가 졸업요건과 수강 데이터를 분석하여 최적의 시간표를 추천합니다.
            </p>
          </div>

          <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[15px] font-black text-black">학교</label>
              <input
                data-testid="input-school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="예) OO대학교"
                className={`${inputClass} ${errors.school ? errorInputClass : ""}`}
              />
              {errors.school && <p className="mt-2 text-sm font-bold text-red-500">{errors.school}</p>}
            </div>

            <div>
              <label className="mb-2 block text-[15px] font-black text-black">학과</label>
              <input
                data-testid="input-major"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="예) OO학과"
                className={`${inputClass} ${errors.major ? errorInputClass : ""}`}
              />
              {errors.major && <p className="mt-2 text-sm font-bold text-red-500">{errors.major}</p>}
            </div>

            <div>
              <label className="mb-2 block text-[15px] font-black text-black">학번</label>
              <input
                data-testid="input-student-number"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="예) 20261234"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-[15px] font-black text-black">학년</label>
              <select
                data-testid="select-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={`${inputClass} ${errors.grade ? errorInputClass : ""}`}
              >
                <option value="">학년 선택</option>
                {gradeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.grade && <p className="mt-2 text-sm font-bold text-red-500">{errors.grade}</p>}
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-[15px] font-black text-black">이번 학기 목표 학점</label>
            <div className="mt-3 rounded-[18px] border border-[#E4E1F0] bg-[#F8F5FF] px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[22px] font-black text-[#6B5DF6]">{targetCredit}학점</span>
                <span className="text-[15px] font-black text-[#9699A8]">1-21학점</span>
              </div>

              <input
                data-testid="range-credit"
                type="range"
                min={1}
                max={21}
                value={targetCredit}
                onChange={(e) => setTargetCredit(Number(e.target.value))}
                className="planpick-credit-range w-full"
                style={{ "--range-progress": rangeProgress } as React.CSSProperties}
              />
            </div>
          </div>

          <div className="mt-9">
            <label className="mb-2 block text-[18px] font-black text-black">
              현재 수강 중인 시간표 이미지 <span className="text-[#9EA2AF]">(선택)</span>
            </label>
            <p className="mb-4 text-[14px] font-bold text-[#A0A4B2]">
              이미지를 여러 장 올리면 약 5초 동안 “이미지 분석 중입니다...”를 보여준 뒤 분석 완료 상태로 바뀝니다.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleImageFiles(e.target.files);
              }}
            />

            {timetableImages.length > 0 ? (
              <div className="rounded-[20px] border border-[#DCD9F0] bg-[#F8F5FF] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-800">업로드된 시간표 {timetableImages.length}개</p>
                    <p className={`mt-1 text-sm font-black ${imageStatus === "complete" ? "text-green-600" : "text-[#6B5DF6]"}`}>
                      {imageStatus === "analyzing" ? "이미지 분석 중입니다..." : "분석 완료!"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-[#6B5DF6] shadow-sm"
                  >
                    추가
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {timetableImages.map((image, index) => (
                    <div key={`${image}-${index}`} className="relative overflow-hidden rounded-2xl bg-white">
                      <img src={image} alt={`업로드된 시간표 ${index + 1}`} className="h-44 w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setTimetableImages((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-md transition-colors hover:text-red-500"
                        aria-label="이미지 제거"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed px-8 py-9 text-center transition-all ${
                  isDragging
                    ? "border-[#6B5DF6] bg-[#F0EDFF]"
                    : "border-[#DCD9F0] bg-[#FAF9FF] hover:border-[#6B5DF6] hover:bg-[#F4F1FF]"
                }`}
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ECE9FF]">
                  <ImagePlus className="h-7 w-7 text-[#6B5DF6]" />
                </div>
                <p className="text-[16px] font-black text-slate-700">이미지를 드래그하거나 클릭하여 업로드</p>
                <p className="mt-1 text-sm font-bold text-[#A0A4B2]">PNG, JPG, JPEG 여러 장 지원</p>
              </div>
            )}
          </div>

          <button
            data-testid="btn-next-step"
            type="submit"
            className="mt-9 rounded-[24px] bg-[#5B3FE8] px-8 py-4 text-[18px] font-black text-white shadow-[0_10px_20px_rgba(91,63,232,0.24)] transition-colors hover:bg-[#4F35D7]"
          >
            다음 단계
          </button>
        </form>
      </div>
    </div>
  );
}
