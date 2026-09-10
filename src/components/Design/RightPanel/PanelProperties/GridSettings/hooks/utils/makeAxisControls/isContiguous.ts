export const isContiguous = (values: number[]): boolean => values.every((value, index) => index === 0 || value === values[index - 1] + 1);
