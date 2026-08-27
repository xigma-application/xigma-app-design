import { nanoid } from '@reduxjs/toolkit';

// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TVectorNode } from 'types/design/types';

export const convertLineToVector = (node: TLineNode): TVectorNode => {
  const startId = nanoid();
  const endId = nanoid();
  const segmentId = nanoid();

  return {
    fillColor: null,
    filledFaceKeys: [],
    id: node.id,
    name: node.name,
    parentId: node.parentId,
    rotation: 0,
    segments: { [segmentId]: { endId, id: segmentId, startId, tangentEnd: null, tangentStart: null } },
    strokeColor: node.stroke,
    strokeWidth: LINE_RENDER_STROKE_WIDTH,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices: { [startId]: { id: startId, x: node.x1, y: node.y1 }, [endId]: { id: endId, x: node.x2, y: node.y2 } },
  };
};
