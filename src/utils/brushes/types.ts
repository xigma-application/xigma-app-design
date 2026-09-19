export type TBrushAlpha = { data: Float32Array; height: number; width: number };

export type TBrushStrip = { data: Float32Array; halfWidth: number; height: number; length: number; scale: number };

export type TBrushContourPoint = { u: number; v: number };

export type TBrushScatterStats = { coverage: number; crossSigma: number; dotRadiusRatio: number };

export type TBrushShape = { contours: TBrushContourPoint[][]; scatter: TBrushScatterStats };
