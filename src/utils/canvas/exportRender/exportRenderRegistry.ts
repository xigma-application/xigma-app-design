// types
import { TColorProfile, TImageFilterQuality } from 'types/canvas';
import { TExportRenderedPixels, TExportRenderer } from './types';

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
  colorProfile: TColorProfile,
): Promise<TExportRenderedPixels | null> =>
  activeRenderer ? activeRenderer(nodeId, scale, ignoreOverlappingLayers, imageFilterQuality, colorProfile) : null;
