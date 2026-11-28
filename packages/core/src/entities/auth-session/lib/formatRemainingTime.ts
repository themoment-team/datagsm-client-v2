// 남은 초를 "mm:ss"로 바꾼다. 분·초는 두 자리로 채운다.
// 한 시간 이상은 시간 단위를 따로 두지 않고 분을 그대로 늘린다(3600 → "60:00").
// 음수·NaN은 0으로, 소수는 내림해서 다룬다.
export const formatRemainingTime = (remainingSeconds: number) => {
  const seconds = Number.isFinite(remainingSeconds) ? Math.max(0, Math.floor(remainingSeconds)) : 0;
  const minutes = Math.floor(seconds / 60);

  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};
