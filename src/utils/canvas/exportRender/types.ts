// types
import { TDraftRect, TImageFilterQuality } from 'types/canvas';

export type TExportRenderedPixels = { height: number; pixels: Uint8Array; width: number };

export type TExportRenderRequest = {
  boundsOverride?: TDraftRect;
  includeNodeIds?: ReadonlySet<string>;
  ignoreOverlappingLayers: boolean;
  imageFilterQuality: TImageFilterQuality;
  nodeId: string | null;
  onResolve: TFunc<[TExportRenderedPixels | null]>;
  scale: number;
};

export type TExportRenderer = (
  nodeId: string | null,
  scale: number,
  ignoreOverlappingLayers: boolean,
  imageFilterQuality: TImageFilterQuality,
  includeNodeIds?: ReadonlySet<string>,
  boundsOverride?: TDraftRect,
) => Promise<TExportRenderedPixels | null>;
