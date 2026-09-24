export const handleEffectOpenChange = (
  index: number,
  isOpen: boolean,
  setSelectedIndices: TFunc<[number[]]>,
  onPickerOpenChange: (index: number, isOpen: boolean) => void,
): void => {
  if (isOpen) {
    setSelectedIndices([index]);
  }

  onPickerOpenChange(index, isOpen);
};
