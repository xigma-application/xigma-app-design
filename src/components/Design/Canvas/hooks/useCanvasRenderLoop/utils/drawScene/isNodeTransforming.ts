// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const isNodeTransforming = (refs: TCanvasRefs, id: string): boolean =>
  Boolean(refs.transform.draggedNodeIdsRef.current?.has(id)) ||
  Boolean(refs.transform.resizedNodeIdsRef.current?.has(id)) ||
  Boolean(refs.transform.rotatedNodeIdsRef.current?.has(id));
