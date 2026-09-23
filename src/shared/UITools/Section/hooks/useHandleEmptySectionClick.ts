export const useHandleEmptySectionClick = (onAdd?: TFunc): TFunc => {
  return (): void => {
    onAdd?.();
  };
};
