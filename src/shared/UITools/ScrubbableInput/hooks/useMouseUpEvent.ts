export type TUseMouseUpEvent = TFunc;

export const useMouseUpEvent = (
  onMouseUp: TFunc,
  setMousePosition: TFunc<[T2DCoordinates | null]>,
): TUseMouseUpEvent => {
  const handleMouseUp = (): void => {
    setMousePosition(null);
    onMouseUp();
    document.exitPointerLock?.();
  };

  return handleMouseUp;
};
