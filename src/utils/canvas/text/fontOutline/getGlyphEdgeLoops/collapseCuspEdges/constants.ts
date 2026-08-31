export const PARALLEL_EPSILON = 1e-3;

// How short a straight bridge run must be, relative to the average length of the two curves it
// connects, to be treated as a degenerate cusp bridge rather than a genuine short straight segment.
// Real bridges observed so far range from a literal zero-length edge up to ~61% of their flanking
// curves' length (the tip of an "x"'s crossing diamond, where the tapering curve on each stroke meets
// the other stroke's edge) — comparing to those specific neighbors (rather than the loop's overall
// typical edge length) stays accurate regardless of how finely a particular curve happens to be
// subdivided.
export const MAX_BRIDGE_RATIO = 0.65;
