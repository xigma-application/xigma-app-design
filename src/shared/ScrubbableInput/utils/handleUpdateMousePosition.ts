export const handleUpdateMousePosition = (
  event: MouseEvent,
  mousePositionNullable: T2DCoordinates | null,
  setMousePosition: TFunc<[T2DCoordinates]>,
): void => {
  const mousePosition = mousePositionNullable as T2DCoordinates;

  switch (true) {
    case mousePosition.x < 0:
      setMousePosition({ x: window.innerWidth, y: mousePosition.y });
      break;
    case mousePosition.x > window.innerWidth:
      setMousePosition({ x: 0, y: mousePosition.y });
      break;
    default:
      setMousePosition({ x: mousePosition.x + event.movementX, y: mousePosition.y });
      break;
  }
};
