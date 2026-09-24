export const getSharedValue = <TValue>(values: TValue[]): TValue | undefined =>
  values.every((value) => value === values[0]) ? values[0] : undefined;
