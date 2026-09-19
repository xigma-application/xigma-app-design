// types
import { TBrushStrip } from '../types';
import { TCellEdgeName, TContourGraph } from './types';

// others
import { THRESHOLD } from './constants';

// utils
import { getCellIndex } from './getCellIndex';
import { getCellSegments } from './getCellSegments';
import { getEdgePoint } from './getEdgePoint';
import { getPaddedValue } from './getPaddedValue';
import { linkEdges } from './linkEdges';

export const addCellSegments = (strip: TBrushStrip, graph: TContourGraph, x: number, y: number): void => {
  const index = getCellIndex(strip, x, y);

  if (index !== 0 && index !== 15) {
    const edges: Record<TCellEdgeName, ReturnType<typeof getEdgePoint>> = {
      bottom: getEdgePoint(strip, [x, y + 1], [x + 1, y + 1], `h${x},${y + 1}`),
      left: getEdgePoint(strip, [x, y], [x, y + 1], `v${x},${y}`),
      right: getEdgePoint(strip, [x + 1, y], [x + 1, y + 1], `v${x + 1},${y}`),
      top: getEdgePoint(strip, [x, y], [x + 1, y], `h${x},${y}`),
    };
    const center =
      (getPaddedValue(strip, x, y) +
        getPaddedValue(strip, x + 1, y) +
        getPaddedValue(strip, x + 1, y + 1) +
        getPaddedValue(strip, x, y + 1)) /
      4;

    getCellSegments(index, center >= THRESHOLD).forEach(([first, second]) => linkEdges(graph, edges[first], edges[second]));
  }
};
