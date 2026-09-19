export const getArcLengths = (points: { x: number; y: number }[]): number[] => {
  const lengths: number[] = [];
  let total = 0;

  points.forEach((point, index) => {
    total += index === 0 ? 0 : Math.hypot(point.x - points[index - 1].x, point.y - points[index - 1].y);
    lengths.push(total);
  });

  return lengths;
};
