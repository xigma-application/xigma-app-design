// types
import { TImageRenderContext } from '../../types';
import { TImageFilterQuality, TPoint } from 'types/canvas';
import { SizingMode } from 'types/design/enums';
import { TViewport } from 'types/design/types';

export type TDrawContext = {
  buffer: WebGLBuffer;
  canvasHeight: number;
  canvasWidth: number;
  devicePixelHeight?: number;
  devicePixelWidth?: number;
  gl: WebGL2RenderingContext;
  imageFilterQuality?: TImageFilterQuality;
  program: WebGLProgram;
  viewport: TViewport;
};

export type TBoxPaintPhase = 'all' | 'fill' | 'stroke';

export type TDrawSceneContext = TDrawContext & {
  imageContext: TImageRenderContext;
};

export type TStrokeRing = {
  cumulative: number[];
  inner: TPoint[];
  lengths: number[];
  mids: TPoint[];
  outer: TPoint[];
  perimeter: number;
};

export type TStrokeRingSample = { mid: TPoint; tangent: TPoint; vec: TPoint };

export type TSizeLabelSizingModes = { height?: SizingMode; width?: SizingMode };
