export const areGapsUniform = (values: number[], toleranceWorldUnits: number): boolean => {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

  return values.every((value) => Math.abs(value - mean) <= toleranceWorldUnits);
};
