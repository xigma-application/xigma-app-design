export const usePopoverOpenChange = (closeSampler: TFunc, onOpenChange?: TFunc<[boolean]>): TFunc<[boolean]> => {
  return (open: boolean): void => {
    if (!open) {
      closeSampler();
    }

    onOpenChange?.(open);
  };
};
