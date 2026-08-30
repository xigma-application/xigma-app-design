export const isAxisSwapped = (rotation: number): boolean =>
  Math.abs(Math.sin((rotation * Math.PI) / 180)) > Math.abs(Math.cos((rotation * Math.PI) / 180));
