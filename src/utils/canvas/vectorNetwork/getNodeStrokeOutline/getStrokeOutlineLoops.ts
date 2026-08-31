// types
import { NodeType } from 'types/design/enums';
import { TStrokeableNode } from './types';

// utils
import { getEllipseStrokeOutlineLoops } from './getEllipseStrokeOutlineLoops';
import { getLineStrokeOutlineLoops } from './getLineStrokeOutlineLoops';
import { getRectangleStrokeOutlineLoops } from './getRectangleStrokeOutlineLoops';
import { getVectorStrokeOutlineLoops } from './getVectorStrokeOutlineLoops';
import { TStrokeOutlineLoops } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

export const getStrokeOutlineLoops = (node: TStrokeableNode, halfWidth: number): TStrokeOutlineLoops | null => {
  switch (node.type) {
    case NodeType.rectangle:
      return getRectangleStrokeOutlineLoops(node, halfWidth);
    case NodeType.ellipse:
      return getEllipseStrokeOutlineLoops(node, halfWidth);
    case NodeType.line:
      return getLineStrokeOutlineLoops(node, halfWidth);
    case NodeType.vector:
      return getVectorStrokeOutlineLoops(node, halfWidth);
    // no default
  }
};
