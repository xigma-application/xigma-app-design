// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TBoxPaintPhase, TDrawSceneContext } from '../types';
import { TRectChunk } from 'utils/canvas/drawRectBatch/types';
import { TRenderTargetPool } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TBooleanShape } from '../drawBooleanLeafNode/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

export type TMaskRenderer = {
  context: TDrawSceneContext;
  gl: WebGL2RenderingContext;
  hoistedIds: Set<string>;
  nodesById?: Record<string, TSceneNode>;
  paintLeaf: (node: TSceneNode, phase?: TBoxPaintPhase) => void;
  pool: TRenderTargetPool;
  refs: TCanvasRefs;
  sceneNodeById: Map<string, TSceneNode>;
};

export type TScissorRect = {
  clipped?: boolean;
  height: number;
  margin?: number;
  offscreen?: boolean;
  originX?: number;
  originY?: number;
  rawHeight?: number;
  rawWidth?: number;
  width: number;
  x: number;
  y: number;
};

export type TBlurCacheEntry = {
  clipped: boolean;
  framebuffer: WebGLFramebuffer;
  height: number;
  key: string;
  texture: WebGLTexture;
  width: number;
  x: number;
  y: number;
  zoom: number;
};

export type TGlassCacheEntry = {
  framebuffer: WebGLFramebuffer;
  height: number;
  localX: number;
  localY: number;
  maskFramebuffer: WebGLFramebuffer;
  maskTexture: WebGLTexture;
  nodesState: unknown;
  rawHeight: number;
  rawWidth: number;
  texture: WebGLTexture;
  validBottom: number;
  validLeft: number;
  validRight: number;
  validTop: number;
  width: number;
};

export type TRectSegment = { chunk: TRectChunk } | { node: TSceneNode };

export type TGlassShapeSdf = {
  bounds: TDraftRect;
  origin: TPoint;
  size: { height: number; width: number };
  texture: WebGLTexture;
};

export type TGlassShapeSdfCacheEntry = TGlassShapeSdf & { shape: TBooleanShape };
