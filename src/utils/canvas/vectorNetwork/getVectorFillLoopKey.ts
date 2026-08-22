export const getVectorFillLoopKey = (pieceKeys: string[]): string => [...new Set(pieceKeys)].sort().join(',');
