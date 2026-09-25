// types
import { THoverResult } from './types';

export const getHandleHoverResult = (hit: { nodeId: string } | null, className: string): THoverResult | undefined =>
  hit ? { className, cursor: '', nodeId: hit.nodeId } : undefined;
