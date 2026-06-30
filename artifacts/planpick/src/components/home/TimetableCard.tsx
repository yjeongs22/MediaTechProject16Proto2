export function TimetableCard() {
  return (
    <img
      src={`${import.meta.env.BASE_URL}main-timetable.png`}
      alt="시간표 추천 미리보기"
      className="h-full w-full object-contain drop-shadow-xl"
    />
  );
}
