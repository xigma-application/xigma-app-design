export type TGlyphChar = {
  height: number;
  id: number;
  width: number;
  x: number;
  xadvance: number;
  xoffset: number;
  y: number;
  yoffset: number;
};

export type TGlyphKerning = {
  amount: number;
  first: number;
  second: number;
};

export type TGlyphAtlasInfo = {
  size: number;
};

export type TGlyphAtlasCommon = {
  base: number;
  lineHeight: number;
  scaleH: number;
  scaleW: number;
};

export type TGlyphAtlasDistanceField = {
  distanceRange: number;
  fieldType: 'msdf';
};

export type TGlyphAtlasJson = {
  chars: TGlyphChar[];
  common: TGlyphAtlasCommon;
  distanceField: TGlyphAtlasDistanceField;
  info: TGlyphAtlasInfo;
  kernings: TGlyphKerning[];
  pages: string[];
};
