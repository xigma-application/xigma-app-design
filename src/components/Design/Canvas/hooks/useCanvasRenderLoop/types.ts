// types
import { TEllipseArcLengthSample } from 'types/canvas';

// utils
import { TTextGeometry } from 'utils/canvas/text/getOrBuildTextGeometry';

export type TImageRenderContext = {
  buffer: WebGLBuffer;
  cache: Map<string, WebGLTexture>;
  ellipseArcLengthCache: Map<string, TEllipseArcLengthSample[]>;
  msdfBuffer: WebGLBuffer;
  msdfProgram: WebGLProgram;
  program: WebGLProgram;
  textGeometryCache: Map<string, TTextGeometry>;
};
