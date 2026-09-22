import { useEffect } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TImageFilterQuality } from 'types/canvas';
import { TExportRenderedPixels } from 'utils/canvas/exportRender/types';

// utils
import { registerExportRenderer } from 'utils/canvas/exportRender/exportRenderRegistry';

export const useRegisterExportRenderer = (refs: TCanvasRefs): void => {
  useEffect(() => {
    const renderNode = (
      nodeId: string | null,
      scale: number,
      ignoreOverlappingLayers: boolean,
      imageFilterQuality: TImageFilterQuality,
      includeNodeIds?: ReadonlySet<string>,
      boundsOverride?: TDraftRect,
    ): Promise<TExportRenderedPixels | null> =>
      new Promise((resolve) => {
        refs.exportRenderRequestRef.current = {
          boundsOverride,
          ignoreOverlappingLayers,
          imageFilterQuality,
          includeNodeIds,
          nodeId,
          onResolve: resolve,
          scale,
        };
      });

    return registerExportRenderer(renderNode);
  }, [refs]);
};
