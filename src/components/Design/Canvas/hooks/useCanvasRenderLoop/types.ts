// types
import { TEllipseArcLengthSample, TPoint } from 'types/canvas';

// utils
import { TTextGeometry } from 'utils/canvas/text/getOrBuildTextGeometry';

export type TImageRenderContext = {
  buffer: WebGLBuffer;
  cache: Map<string, WebGLTexture>;
  ellipseArcLengthCache: Map<string, TEllipseArcLengthSample[]>;
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer>;
  gridBuffer: WebGLBuffer;
  gridProgram: WebGLProgram;
  msdfBuffer: WebGLBuffer;
  msdfProgram: WebGLProgram;
  program: WebGLProgram;
  strokeBufferCache: WeakMap<number[], WebGLBuffer>;
  textGeometryCache: Map<string, TTextGeometry>;
};
