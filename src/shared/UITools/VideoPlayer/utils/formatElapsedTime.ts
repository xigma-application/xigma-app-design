export const formatElapsedTime = (currentTime: number): string => {
  const elapsedSeconds = Number.isFinite(currentTime) ? Math.max(0, Math.floor(currentTime)) : 0;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
