export const getAutoLayoutBlockCounterLength = (counterAxisSpacing: number, lineThicknesses: number[]): number =>
  lineThicknesses.reduce((total, thickness, index) => total + thickness + (index > 0 ? counterAxisSpacing : 0), 0);
