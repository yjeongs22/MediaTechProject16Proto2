export function TimetableCard() {
  return (
    <img
      src={`${import.meta.env.BASE_URL}main-timetable.png`}
      alt="시간표"
      className="w-full h-full object-contain drop-shadow-xl"
    />
  );
}
