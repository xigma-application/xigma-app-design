import { useCallback, useEffect } from 'react';

// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// types
import { BlendMode } from 'types/design/enums';

export type TUseEffectBlendModePreviewResult = {
  onBlendModePreview: (index: number, blendMode: BlendMode | null) => void;
};

export const useEffectBlendModePreview = (nodeId: string | undefined, openIndex: number | null): TUseEffectBlendModePreviewResult => {
  const { blendMode } = useCanvasRefsContext();
  const { effectPreviewRef } = blendMode;

  const clearPreview = useCallback((): void => {
    effectPreviewRef.current = null;
  }, [effectPreviewRef]);

  useEffect(() => clearPreview, [clearPreview, openIndex]);

  return {
    onBlendModePreview: (index, previewBlendMode): void => {
      effectPreviewRef.current = nodeId && previewBlendMode ? { blendMode: previewBlendMode, effectIndex: index, nodeId } : null;
    },
  };
};
