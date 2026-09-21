import { useEffect } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TExportRenderedPixels } from 'utils/canvas/exportRender/types';
import { TImageFilterQuality } from 'types/canvas';

// utils
import { registerExportRenderer } from 'utils/canvas/exportRender/exportRenderRegistry';

export const useRegisterExportRenderer = (refs: TCanvasRefs): void => {
  useEffect(() => {
    const renderNode = (
      nodeId: string,
      scale: number,
      ignoreOverlappingLayers: boolean,
      imageFilterQuality: TImageFilterQuality,
      includeNodeIds?: ReadonlySet<string>,
    ): Promise<TExportRenderedPixels | null> =>
      new Promise((resolve) => {
        refs.exportRenderRequestRef.current = {
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
