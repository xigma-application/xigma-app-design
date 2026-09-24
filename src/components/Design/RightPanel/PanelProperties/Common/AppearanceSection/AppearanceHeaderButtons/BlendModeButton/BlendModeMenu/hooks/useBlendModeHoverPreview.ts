// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// types
import { BlendMode } from 'types/design/enums';

export type TUseBlendModeHoverPreviewResult = {
  onOptionMouseEnter: (blendMode: BlendMode) => TFunc;
  onOptionMouseLeave: TFunc;
};

export const useBlendModeHoverPreview = (nodeIds: string[]): TUseBlendModeHoverPreviewResult => {
  const { blendMode } = useCanvasRefsContext();

  return {
    onOptionMouseEnter: (mode: BlendMode) => (): void => {
      blendMode.previewRef.current = { blendMode: mode, nodeIds };
    },
    onOptionMouseLeave: (): void => {
      blendMode.previewRef.current = null;
    },
  };
};
