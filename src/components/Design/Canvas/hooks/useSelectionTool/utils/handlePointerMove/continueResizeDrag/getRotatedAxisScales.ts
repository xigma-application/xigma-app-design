export const getRotatedAxisScales = (scaleX: number, scaleY: number, rotation: number): { x: number; y: number } => {
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    x: Math.sqrt((scaleX * cos) ** 2 + (scaleY * sin) ** 2),
    y: Math.sqrt((scaleX * sin) ** 2 + (scaleY * cos) ** 2),
  };
};
