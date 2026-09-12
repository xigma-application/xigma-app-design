export type TSquircleCornerPathParams = {
  a: number;
  arcSectionLength: number;
  b: number;
  c: number;
  d: number;
  p: number;
};

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export const getSquircleCornerPathParams = (
  cornerRadius: number,
  cornerSmoothing: number,
  roundingAndSmoothingBudget: number,
): TSquircleCornerPathParams => {
  const maxSmoothing = Math.max(roundingAndSmoothingBudget / cornerRadius - 1, 0);
  const smoothing = Math.min(cornerSmoothing, maxSmoothing);
  const p = Math.min((1 + smoothing) * cornerRadius, roundingAndSmoothingBudget);
  const arcMeasure = 90 * (1 - smoothing);
  const arcSectionLength = Math.sin(toRadians(arcMeasure / 2)) * cornerRadius * Math.sqrt(2);
  const angleAlpha = (90 - arcMeasure) / 2;
  const p3ToP4Distance = cornerRadius * Math.tan(toRadians(angleAlpha / 2));
  const angleBeta = 45 * smoothing;
  const c = p3ToP4Distance * Math.cos(toRadians(angleBeta));
  const d = c * Math.tan(toRadians(angleBeta));
  const b = (p - arcSectionLength - c - d) / 3;
  const a = 2 * b;

  return { a, arcSectionLength, b, c, d, p };
};
