export const getEllipseArcSweepPercent = (arcStartAngle: number, arcEndAngle: number): number | null => {
  const sweep = arcEndAngle - arcStartAngle;

  if (sweep !== 0) {
    const direction = Math.sign(sweep);
    const absSweep = Math.abs(sweep);
    const withinCycle = absSweep % 360;
    const isRefillingCycle = Math.floor(absSweep / 360) % 2 === 1;
    const magnitudePercent = isRefillingCycle ? (withinCycle / 360) * 100 : 100 - (withinCycle / 360) * 100;
    const sign = isRefillingCycle ? -direction : direction;
    const percent = sign * magnitudePercent;

    if (Math.abs(percent) === 100) {
      return null;
    }

    return percent === 0 ? 0 : percent;
  }

  return null;
};
