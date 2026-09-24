export type TTrackedGlState = {
  blend: [number, number, number, number];
  framebuffer: WebGLFramebuffer | null;
  viewport: [number, number, number, number];
};
