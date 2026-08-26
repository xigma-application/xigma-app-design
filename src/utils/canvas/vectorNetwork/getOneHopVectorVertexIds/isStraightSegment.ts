export const isStraightSegment = (segment: { tangentEnd: unknown; tangentStart: unknown }): boolean =>
  !segment.tangentStart && !segment.tangentEnd;
