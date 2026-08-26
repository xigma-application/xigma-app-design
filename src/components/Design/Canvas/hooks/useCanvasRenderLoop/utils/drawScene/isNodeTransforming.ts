// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const isNodeTransforming = (refs: TCanvasRefs, id: string): boolean =>
  Boolean(refs.draggedNodeIdsRef.current?.has(id)) ||
  Boolean(refs.resizedNodeIdsRef.current?.has(id)) ||
  Boolean(refs.rotatedNodeIdsRef.current?.has(id));
