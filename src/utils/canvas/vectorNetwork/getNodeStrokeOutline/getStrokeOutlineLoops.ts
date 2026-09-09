// types
import { NodeType } from 'types/design/enums';
import { TStrokeableNode } from './types';

// utils
import { getEllipseStrokeOutlineLoops } from './getEllipseStrokeOutlineLoops';
import { getLineStrokeOutlineLoops } from './getLineStrokeOutlineLoops';
import { getRectangleStrokeOutlineLoops } from './getRectangleStrokeOutlineLoops';
import { getVectorStrokeOutlineLoops } from './getVectorStrokeOutlineLoops';
import { TStrokeOutlineLoops } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

export const getStrokeOutlineLoops = (node: TStrokeableNode, outer: number, inner: number = outer): TStrokeOutlineLoops | null => {
  switch (node.type) {
    case NodeType.rectangle:
      return getRectangleStrokeOutlineLoops(node, outer, inner);
    case NodeType.ellipse:
      return getEllipseStrokeOutlineLoops(node, outer, inner);
    case NodeType.line:
      return getLineStrokeOutlineLoops(node, outer);
    case NodeType.vector:
      return getVectorStrokeOutlineLoops(node, outer);
    // no default
  }
};
