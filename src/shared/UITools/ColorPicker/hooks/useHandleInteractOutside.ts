export const useHandleInteractOutside = (
  ignoreSamplerInteractOutside: TFunc<[Event]>,
  ignoreGradientCanvasInteractOutside: TFunc<[Event]>,
): TFunc<[Event]> => {
  return (event: Event): void => {
    ignoreSamplerInteractOutside(event);
    ignoreGradientCanvasInteractOutside(event);
  };
};
