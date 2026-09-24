export const getSharedValue = <TItem, TValue>(items: TItem[], getValue: TFunc<[TItem], TValue>, emptyValue: TValue): TValue | undefined => {
  const values = items.map(getValue);

  if (values.length > 0) {
    return values.every((value) => value === values[0]) ? values[0] : undefined;
  }

  return emptyValue;
};
