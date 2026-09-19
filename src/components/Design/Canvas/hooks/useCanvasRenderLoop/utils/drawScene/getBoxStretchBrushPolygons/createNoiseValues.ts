export const createNoiseValues = (random: () => number, count: number): number[] => Array.from({ length: count }, () => random() * 2 - 1);
