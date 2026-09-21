// types
import { TColorProfile, TImageFilterQuality } from 'types/canvas';

export type TExportRenderedPixels = { height: number; pixels: Uint8Array; width: number };

export type TExportRenderRequest = {
  colorProfile: TColorProfile;
  ignoreOverlappingLayers: boolean;
  imageFilterQuality: TImageFilterQuality;
  nodeId: string;
  onResolve: TFunc<[TExportRenderedPixels | null]>;
  scale: number;
};

export type TExportRenderer = (
  nodeId: string,
  scale: number,
  ignoreOverlappingLayers: boolean,
  imageFilterQuality: TImageFilterQuality,
  colorProfile: TColorProfile,
) => Promise<TExportRenderedPixels | null>;
