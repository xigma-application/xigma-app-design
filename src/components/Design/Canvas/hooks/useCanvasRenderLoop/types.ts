export type TImageRenderContext = {
  buffer: WebGLBuffer;
  cache: Map<string, WebGLTexture>;
  msdfBuffer: WebGLBuffer;
  msdfProgram: WebGLProgram;
  program: WebGLProgram;
  textGeometryCache: Map<string, Float32Array>;
};
