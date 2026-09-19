const getDistanceToLine = (point: { x: number; y: number }, from: { x: number; y: number }, to: { x: number; y: number }): number => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);

  return length === 0
    ? Math.hypot(point.x - from.x, point.y - from.y)
    : Math.abs(dy * point.x - dx * point.y + to.x * from.y - to.y * from.x) / length;
};

export const simplifyBrushLoop = (points: { x: number; y: number }[], epsilon: number): { x: number; y: number }[] => {
  if (points.length > 4) {
    const keep = new Array<boolean>(points.length).fill(false);
    const half = Math.floor(points.length / 2);
    const stack: [number, number][] = [
      [0, half],
      [half, points.length - 1],
    ];

    keep[0] = true;
    keep[half] = true;
    keep[points.length - 1] = true;

    while (stack.length > 0) {
      const [start, end] = stack.pop() as [number, number];
      let worst = -1;
      let worstDistance = epsilon;

      for (let index = start + 1; index < end; index += 1) {
        const distance = getDistanceToLine(points[index], points[start], points[end]);

        if (distance > worstDistance) {
          worst = index;
          worstDistance = distance;
        }
      }

      if (worst !== -1) {
        keep[worst] = true;
        stack.push([start, worst], [worst, end]);
      }
    }

    return points.filter((_, index) => keep[index]);
  }

  return points;
};
