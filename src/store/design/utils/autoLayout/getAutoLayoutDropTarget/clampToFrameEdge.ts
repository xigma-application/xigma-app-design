// others
import { INDICATOR_MIN_EDGE_GAP_PX } from '../constants';

export const clampToFrameEdge = (value: number, edge: number): number => Math.max(value, edge + INDICATOR_MIN_EDGE_GAP_PX);
