export type TRenderTarget = {
  framebuffer: WebGLFramebuffer;
  height: number;
  stencil: WebGLRenderbuffer;
  texture: WebGLTexture;
  width: number;
};

export type TRenderTargetPool = {
  acquire: () => TRenderTarget;
  dispose: () => void;
  release: (target: TRenderTarget) => void;
};

export type TRenderTargetPoolState = {
  all: TRenderTarget[];
  free: TRenderTarget[];
  poolHeight: number;
  poolWidth: number;
};
