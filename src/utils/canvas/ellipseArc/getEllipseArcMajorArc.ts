export type TEllipseMajorArc = { majorStart: number; majorSweep: number };

export const getEllipseArcMajorArc = (startAngleDeg: number, endAngleDeg: number): TEllipseMajorArc => {
  const signedSweep = endAngleDeg - startAngleDeg;

  if (signedSweep === 0) {
    return { majorStart: endAngleDeg, majorSweep: 360 };
  }

  const direction = Math.sign(signedSweep);
  const absSweep = Math.abs(signedSweep);
  const withinCycle = absSweep % 360;
  const isRefillingCycle = Math.floor(absSweep / 360) % 2 === 1;

  return isRefillingCycle
    ? { majorStart: startAngleDeg, majorSweep: direction * withinCycle }
    : { majorStart: endAngleDeg, majorSweep: direction * (360 - withinCycle) };
};
