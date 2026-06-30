import React, { useRef, useState } from "react";
import { useLocation } from "wouter";
import { setCurrentRequestId, setData, type StudentInfo } from "@/lib/storage";
import { ArrowLeft, ImagePlus, X } from "lucide-react";

export default function RequestPage() {
  const [, setLocation] = useLocation();
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [grade, setGrade] = useState("");
  const [targetCredit, setTargetCredit] = useState(18);
  const [overToggle, setOverToggle] = useState(false);
  const [overCredit, setOverCredit] = useState(22);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timetableImage, setTimetableImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const creditValue = overToggle ? overCredit : targetCredit;
  const rangeProgress = `${((targetCredit - 1) / 20) * 100}%`;

  function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setTimetableImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!school.trim()) e.school = "학교를 입력해주세요";
    if (!major.trim()) e.major = "학과를 입력해주세요";
    if (!grade) e.grade = "학년을 선택해주세요";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const student: StudentInfo = {
      school,
      major,
      studentNumber,
      grade,
      targetCredit: creditValue,
    };

    setData("planpickStudent", student);
    setCurrentRequestId(String(Date.now()));
    setLocation("/request/needs");
  }

  const inputClass =
    "h-12 w-full rounded-2xl border border-[#D8D8E0] bg-white px-4 text-[14px] font-bold text-slate-900 outline-none transition-all placeholder:text-[#A1A5B4] focus:border-[#6D5DF4] focus:ring-4 focus:ring-[#6D5DF4]/10";
  const errorInputClass = "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100";

  return (
    <div className="min-h-full bg-[#F4F2FF] px-6 py-6 md:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-6 flex items-center gap-6">
          <button
            type="button"
            onClick={() => setLocation("/")}
            data-testid="btn-back-home"
            className="flex h-11 items-center gap-1.5 rounded-2xl bg-[#ECE9FA] px-4 text-[15px] font-black text-slate-900 transition-colors hover:bg-[#E4DFFA]"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로
          </button>
          <h2 className="text-[26px] font-black text-[#6B5DF6]">기본 정보 입력</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] bg-white/92 px-8 py-9 shadow-[0_14px_35px_rgba(42,33,95,0.08)] ring-1 ring-[#ECEAF5] backdrop-blur md:px-12"
        >
          <div className="mb-10">
            <h1 className="text-[44px] font-black leading-tight text-black md:text-[52px]">기본 정보 입력</h1>
            <p className="mt-5 text-[18px] font-bold text-[#9296A5] md:text-[21px]">
              학교와 학과 정보를 입력하면 AI가 졸업요건과 수강 데이터를 분석하여 최적의 시간표를 추천합니다.
            </p>
          </div>

          <div className="grid gap-x-6 gap-y-7 md:grid-cols-2">
            <div>
              <label className="mb-2.5 block text-[18px] font-black text-black">학교</label>
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
              <label className="mb-2.5 block text-[18px] font-black text-black">학과</label>
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
              <label className="mb-2.5 block text-[18px] font-black text-black">학번</label>
              <input
                data-testid="input-student-number"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="예) 20261234"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2.5 block text-[18px] font-black text-black">학년</label>
              <select
                data-testid="select-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={`${inputClass} appearance-none ${errors.grade ? errorInputClass : ""}`}
              >
                <option value="">예) O학년</option>
                <option value="1학년">1학년</option>
                <option value="2학년">2학년</option>
                <option value="3학년">3학년</option>
                <option value="4학년">4학년</option>
              </select>
              {errors.grade && <p className="mt-2 text-sm font-bold text-red-500">{errors.grade}</p>}
            </div>
          </div>

          <div className="mt-8">
            <label className="mb-2.5 block text-[18px] font-black text-black">이번 학기 목표 학점</label>
            <select
              value={targetCredit}
              onChange={(e) => setTargetCredit(Number(e.target.value))}
              disabled={overToggle}
              className={`${inputClass} appearance-none disabled:opacity-55`}
            >
              {Array.from({ length: 21 }, (_, i) => i + 1).map((credit) => (
                <option key={credit} value={credit}>
                  예) {credit}학점
                </option>
              ))}
            </select>

            <div className="mt-6 rounded-[20px] border border-[#E4E1F0] bg-[#F8F5FF] px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[28px] font-black text-[#6B5DF6]">{creditValue}학점</span>
                <span className="text-[18px] font-black text-[#9699A8]">1-{overToggle ? "40" : "21"}학점</span>
              </div>

              <input
                data-testid="range-credit"
                type="range"
                min={1}
                max={21}
                value={targetCredit}
                disabled={overToggle}
                onChange={(e) => setTargetCredit(Number(e.target.value))}
                className="planpick-credit-range w-full disabled:opacity-45"
                style={{ "--range-progress": rangeProgress } as React.CSSProperties}
              />

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <button
                  data-testid="toggle-over-credit"
                  type="button"
                  aria-pressed={overToggle}
                  onClick={() => setOverToggle((value) => !value)}
                  className={`relative h-9 w-[72px] rounded-full transition-all ${
                    overToggle ? "bg-[#6B5DF6]" : "bg-[#D9D9E8] shadow-inner"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow-[0_2px_8px_rgba(45,39,80,0.24)] transition-all ${
                      overToggle ? "left-10" : "left-1"
                    }`}
                  />
                </button>
                <span className="text-[18px] font-black text-[#9A9EAD]">22학점 이상</span>

                {overToggle && (
                  <div className="flex items-center gap-2">
                    <input
                      data-testid="input-over-credit"
                      type="number"
                      min={22}
                      max={40}
                      value={overCredit}
                      onChange={(e) => setOverCredit(Number(e.target.value))}
                      className="h-10 w-24 rounded-xl border border-[#CFCBEA] px-3 text-sm font-bold outline-none focus:border-[#6B5DF6] focus:ring-4 focus:ring-[#6B5DF6]/10"
                    />
                    <span className="text-sm font-bold text-[#858998]">학점</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-9">
            <label className="mb-2 block text-[18px] font-black text-black">
              현재 수강 중인 시간표 이미지 <span className="text-[#9EA2AF]">(선택)</span>
            </label>
            <p className="mb-4 text-[14px] font-bold text-[#A0A4B2]">
              이미 듣고 있는 수업 시간표를 업로드하면 AI가 해당 시간을 제외하고 추천합니다.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
            />

            {timetableImage ? (
              <div className="relative overflow-hidden rounded-[20px] border border-[#DCD9F0] bg-[#F8F5FF]">
                <img src={timetableImage} alt="업로드된 시간표" className="h-64 w-full object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setTimetableImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-md transition-colors hover:text-red-500"
                  aria-label="이미지 삭제"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-4 rounded-full bg-[#6B5DF6] px-4 py-2 text-sm font-black text-white">
                  이미지 업로드 완료
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
                <p className="mt-1 text-sm font-bold text-[#A0A4B2]">PNG, JPG, JPEG 지원</p>
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
