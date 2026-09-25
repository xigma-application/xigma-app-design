// others
import { LINE_ENDPOINT_ARC_SEGMENTS } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';

export const getRoundEndPoints = (halfWidth: number): TPoint[] =>
  Array.from({ length: LINE_ENDPOINT_ARC_SEGMENTS + 1 }, (_, index) => {
    const angle = Math.PI / 2 - (Math.PI * index) / LINE_ENDPOINT_ARC_SEGMENTS;
    return { x: halfWidth * Math.cos(angle), y: halfWidth * Math.sin(angle) };
  });
