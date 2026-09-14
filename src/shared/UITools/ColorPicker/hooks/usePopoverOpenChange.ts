export const usePopoverOpenChange = (
  closeSampler: TFunc,
  closePatternSourcePicking: TFunc,
  onOpenChange?: TFunc<[boolean]>,
): TFunc<[boolean]> => {
  return (open: boolean): void => {
    if (!open) {
      closeSampler();
      closePatternSourcePicking();
    }

    onOpenChange?.(open);
  };
};
