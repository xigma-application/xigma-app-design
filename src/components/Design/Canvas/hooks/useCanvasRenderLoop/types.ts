// types
import { TEllipseArcLengthSample, TPoint } from 'types/canvas';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';
import { TVertexDotBufferCacheEntry } from './utils/drawScene/drawVectorEditHandlesLayer/drawVectorVertexDots/types';

// utils
import { TRenderTargetPool } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TTextGeometry } from 'utils/canvas/text/getOrBuildTextGeometry';
import { TTextureSize } from 'utils/canvas/getOrLoadTexture';

export type TImageRenderContext = {
  blendCompositeBuffer: WebGLBuffer;
  blendCompositeProgram: WebGLProgram;
  buffer: WebGLBuffer;
  cache: Map<string, WebGLTexture>;
  checkerboardProgram: WebGLProgram;
  dragGradientProgram: WebGLProgram;
  dragSnapshotFaceBufferCache: WeakMap<TPoint[], WebGLBuffer>;
  dragSnapshotProgram: WebGLProgram;
  dragSnapshotStrokeBufferCache: WeakMap<number[], WebGLBuffer>;
  dragSnapshotTrackedByNodeId: Map<string, TVectorNodeDragSnapshot>;
  ellipseArcLengthCache: Map<string, TEllipseArcLengthSample[]>;
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer>;
  gradientProgram: WebGLProgram;
  gridBuffer: WebGLBuffer;
  gridProgram: WebGLProgram;
  imagePaintTextureSizeCache: Map<string, TTextureSize>;
  isAlphaWriteEnabled: boolean;
  maskCompositeBuffer: WebGLBuffer;
  maskCompositeProgram: WebGLProgram;
  msdfBuffer: WebGLBuffer;
  msdfProgram: WebGLProgram;
  patternTileProgram: WebGLProgram;
  program: WebGLProgram;
  renderTargetPool: TRenderTargetPool;
  strokeBufferCache: WeakMap<number[], WebGLBuffer>;
  textGeometryCache: Map<string, TTextGeometry>;
  vertexDotBufferCache: WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>;
};
