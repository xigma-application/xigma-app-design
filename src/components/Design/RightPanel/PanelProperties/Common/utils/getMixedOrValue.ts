export const getMixedOrValue = (values: number[]): 'mixed' | number => (values.every((value) => value === values[0]) ? values[0] : 'mixed');
