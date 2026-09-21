import { useEffect } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TColorProfile, TImageFilterQuality } from 'types/canvas';
import { TExportRenderedPixels } from 'utils/canvas/exportRender/types';

// utils
import { registerExportRenderer } from 'utils/canvas/exportRender/exportRenderRegistry';

export const useRegisterExportRenderer = (refs: TCanvasRefs): void => {
  useEffect(() => {
    const renderNode = (
      nodeId: string,
      scale: number,
      ignoreOverlappingLayers: boolean,
      imageFilterQuality: TImageFilterQuality,
      colorProfile: TColorProfile,
    ): Promise<TExportRenderedPixels | null> =>
      new Promise((resolve) => {
        refs.exportRenderRequestRef.current = {
          colorProfile,
          ignoreOverlappingLayers,
          imageFilterQuality,
          nodeId,
          onResolve: resolve,
          scale,
        };
      });

    return registerExportRenderer(renderNode);
  }, [refs]);
};
