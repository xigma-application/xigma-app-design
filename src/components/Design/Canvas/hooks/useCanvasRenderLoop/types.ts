// types
import { TEllipseArcLengthSample, TPoint } from 'types/canvas';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';
import { TVertexDotBufferCacheEntry } from './utils/drawScene/drawVectorEditHandlesLayer/drawVectorVertexDots/types';

// utils
import { TRenderTargetPool } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TTextGeometry } from 'utils/canvas/text/getOrBuildTextGeometry';

export type TImageRenderContext = {
  buffer: WebGLBuffer;
  cache: Map<string, WebGLTexture>;
  dragSnapshotFaceBufferCache: WeakMap<TPoint[], WebGLBuffer>;
  dragSnapshotProgram: WebGLProgram;
  dragSnapshotStrokeBufferCache: WeakMap<number[], WebGLBuffer>;
  dragSnapshotTrackedByNodeId: Map<string, TVectorNodeDragSnapshot>;
  ellipseArcLengthCache: Map<string, TEllipseArcLengthSample[]>;
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer>;
  gridBuffer: WebGLBuffer;
  gridProgram: WebGLProgram;
  isAlphaWriteEnabled: boolean;
  maskCompositeBuffer: WebGLBuffer;
  maskCompositeProgram: WebGLProgram;
  msdfBuffer: WebGLBuffer;
  msdfProgram: WebGLProgram;
  program: WebGLProgram;
  renderTargetPool: TRenderTargetPool;
  strokeBufferCache: WeakMap<number[], WebGLBuffer>;
  textGeometryCache: Map<string, TTextGeometry>;
  vertexDotBufferCache: WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>;
};
