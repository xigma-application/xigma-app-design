// hooks
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

export const useIgnoreProgressiveBlurInteractOutside = (): TFunc<[Event]> => {
  const { progressiveBlur } = useCanvasRefsContext();

  return (event: Event): void => {
    if (
      (progressiveBlur.hoveredEndpointRef.current !== null || progressiveBlur.dragRef.current !== null) &&
      event.target instanceof HTMLCanvasElement
    ) {
      event.preventDefault();
    }
  };
};
