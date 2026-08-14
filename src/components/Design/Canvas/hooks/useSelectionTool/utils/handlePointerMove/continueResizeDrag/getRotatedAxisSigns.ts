export const getRotatedAxisSigns = (scaleX: number, scaleY: number, rotation: number): { x: number; y: number } => {
  const radians = (rotation * Math.PI) / 180;
  const cos2 = Math.cos(radians) ** 2;
  const sin2 = Math.sin(radians) ** 2;

  return {
    x: scaleX * cos2 + scaleY * sin2,
    y: scaleX * sin2 + scaleY * cos2,
  };
};
