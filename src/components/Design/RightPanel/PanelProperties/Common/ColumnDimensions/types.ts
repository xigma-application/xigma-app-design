export type TDimensionsSize = { height: number; width: number };

export type TDimensionsScrubStart = TDimensionsSize & { sizes: Record<string, TDimensionsSize> };
