export type TPatternThumbnailRequest = { onResolve: TFunc<[string | null]>; size: number; sourceNodeId: string };

export type TPatternThumbnailSampler = (sourceNodeId: string, size: number) => Promise<string | null>;
