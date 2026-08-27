export const useHighlightDropdownOption =
  (onHighlight: TFunc<[number]>) =>
  (index: number): TFunc =>
  () =>
    onHighlight(index);
