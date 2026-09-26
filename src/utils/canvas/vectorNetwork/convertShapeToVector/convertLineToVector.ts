import { nanoid } from '@reduxjs/toolkit';

// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TVectorNode } from 'types/design/types';

// utils
import { getLinePoints } from '../../line/getLinePoints';

export const convertLineToVector = (node: TLineNode): TVectorNode => {
  const { x1, x2, y1, y2 } = getLinePoints(node);
  const startId = nanoid();
  const endId = nanoid();
  const segmentId = nanoid();

  return {
    defaultFill: null,
    filledFaceKeys: [],
    id: node.id,
    name: node.name,
    parentId: node.parentId,
    rotation: 0,
    segments: { [segmentId]: { endId, id: segmentId, startId, tangentEnd: null, tangentStart: null } },
    strokeWidth: node.strokeWidth ?? LINE_RENDER_STROKE_WIDTH,
    strokes: node.strokes,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices: { [endId]: { id: endId, x: x2, y: y2 }, [startId]: { id: startId, x: x1, y: y1 } },
  };
};
