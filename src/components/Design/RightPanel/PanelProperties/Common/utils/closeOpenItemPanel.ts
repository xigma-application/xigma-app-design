export const closeOpenItemPanel = (openPickerIndex: number | null, onPickerOpenChange: (index: number, isOpen: boolean) => void): void => {
  if (openPickerIndex !== null) {
    onPickerOpenChange(openPickerIndex, false);
  }
};
