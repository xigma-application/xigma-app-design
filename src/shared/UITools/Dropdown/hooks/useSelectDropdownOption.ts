export const useSelectDropdownOption =
  <TValue extends string>(onSelect: TFunc<[TValue]>) =>
  (value: TValue): TFunc =>
  () =>
    onSelect(value);
