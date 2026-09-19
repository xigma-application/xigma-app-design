// types
import { TBrushStrip } from '../types';
import { TContourGraph } from './types';

// utils
import { addCellSegments } from './addCellSegments';

export const buildContourGraph = (strip: TBrushStrip): TContourGraph => {
  const graph: TContourGraph = { edges: new Map(), links: new Map() };

  for (let y = 0; y < strip.height + 1; y += 1) {
    for (let x = 0; x < strip.length + 1; x += 1) {
      addCellSegments(strip, graph, x, y);
    }
  }

  return graph;
};
