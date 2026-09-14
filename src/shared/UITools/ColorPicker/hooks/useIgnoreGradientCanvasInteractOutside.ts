export const useIgnoreGradientCanvasInteractOutside = (isPointerOverGradientHandle: TFunc<[], boolean> | undefined): TFunc<[Event]> => {
  return (event: Event): void => {
    if (isPointerOverGradientHandle?.() && event.target instanceof HTMLCanvasElement) {
      event.preventDefault();
    }
  };
};
