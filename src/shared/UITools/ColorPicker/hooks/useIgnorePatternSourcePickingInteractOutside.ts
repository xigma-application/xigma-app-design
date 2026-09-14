export const useIgnorePatternSourcePickingInteractOutside = (isPatternSourcePicking: boolean): TFunc<[Event]> => {
  return (event: Event): void => {
    if (isPatternSourcePicking) {
      event.preventDefault();
    }
  };
};
