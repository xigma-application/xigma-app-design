// types
import { TPaint, TPaintProperty } from 'types/design/paint/types';

export type TPaintOwner = { fills?: TPaint[]; strokes?: TPaint[] };

export const getNodePaints = (node: TPaintOwner, property: TPaintProperty = 'fills'): TPaint[] =>
  property === 'strokes' ? (node.strokes ?? []) : (node.fills ?? []);
