// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

export type TUseTreeItemHoverResult = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export const useTreeItemHover = (id: string): TUseTreeItemHoverResult => {
  const { hover } = useCanvasRefsContext();

  return {
    onMouseEnter: (): void => {
      hover.layersTreeHoverRef.current = id;
    },
    onMouseLeave: (): void => {
      hover.layersTreeHoverRef.current = null;
    },
  };
};
