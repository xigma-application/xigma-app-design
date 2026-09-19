const hashSeed = (seed: string): number =>
  Array.from(seed).reduce((hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0, 2166136261);

export const createSeededRandom = (seed: string): (() => number) => {
  let state = hashSeed(seed);

  return (): number => {
    state = (state + 0x6d2b79f5) >>> 0;

    const mixed = Math.imul(state ^ (state >>> 15), state | 1);
    const result = mixed ^ (mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61));

    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};
