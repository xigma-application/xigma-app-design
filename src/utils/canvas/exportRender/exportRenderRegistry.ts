// types
import { TExportRenderedPixels, TExportRenderer } from './types';
import { TImageFilterQuality } from 'types/canvas';

let activeRenderer: TExportRenderer | null = null;

export const registerExportRenderer = (renderer: TExportRenderer): TFunc => {
  activeRenderer = renderer;

  return (): void => {
    if (activeRenderer === renderer) {
      activeRenderer = null;
    }
  };
};

export const renderNodeForExport = async (
  nodeId: string,
  scale: number,
  ignoreOverlappingLayers: boolean,
  imageFilterQuality: TImageFilterQuality,
): Promise<TExportRenderedPixels | null> =>
  activeRenderer ? activeRenderer(nodeId, scale, ignoreOverlappingLayers, imageFilterQuality) : null;
