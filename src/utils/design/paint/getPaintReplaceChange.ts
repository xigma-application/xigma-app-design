// types
import { TPaint, TPaintProperty } from 'types/design/paint/types';

// utils
import { getNodePaints, TPaintOwner } from './getNodePaints';
import { getPaintsChange } from './getPaintsChange';

export const getPaintReplaceChange = (
  node: TPaintOwner,
  property: TPaintProperty | undefined,
  paintIndex: number,
  paint: TPaint,
): { fills: TPaint[] } | { strokes: TPaint[] } =>
  getPaintsChange(
    property,
    getNodePaints(node, property).map((existing, index) => (index === paintIndex ? paint : existing)),
  );
