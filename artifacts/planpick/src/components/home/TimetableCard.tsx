export function TimetableCard() {
  return (
    <img
      src={`${import.meta.env.BASE_URL}dashboard-overview.png`}
      alt="PlanPick 대시보드 미리보기"
      className="h-auto max-h-[500px] w-full object-contain drop-shadow-2xl"
    />
  );
}
