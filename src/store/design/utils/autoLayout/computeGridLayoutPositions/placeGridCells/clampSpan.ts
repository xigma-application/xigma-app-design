export const clampSpan = (span: number | undefined, max: number): number => Math.min(Math.max(Math.round(span ?? 1), 1), Math.max(max, 1));
