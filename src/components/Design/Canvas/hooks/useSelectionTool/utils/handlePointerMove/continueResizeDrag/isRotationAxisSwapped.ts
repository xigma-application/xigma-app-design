export const isRotationAxisSwapped = (rotation: number): boolean => {
  const radians = (rotation * Math.PI) / 180;

  return Math.abs(Math.sin(radians)) > Math.abs(Math.cos(radians));
};
