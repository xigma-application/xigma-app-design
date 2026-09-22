export type TPatternThumbnailRequest = { onResolve: TFunc<[string | null]>; size: number; sourceNodeId: string | null };

export type TPatternThumbnailSampler = (sourceNodeId: string | null, size: number) => Promise<string | null>;
