export type TEffectTextureEntry = {
  bytes: number;
  texture: WebGLTexture;
};

export type TEffectTextureCache = {
  bytes: number;
  entries: Map<string, TEffectTextureEntry>;
};
