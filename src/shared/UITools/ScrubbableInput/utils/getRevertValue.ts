export const getRevertValue = (defaultValue: number, max: number, min: number, value: number): number => {
  switch (value) {
    case max:
      return min;
    case min:
      return max;
    default:
      return defaultValue;
  }
};
