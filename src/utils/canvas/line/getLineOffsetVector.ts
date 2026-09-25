// types
import { NodeType, StrokeJoin } from 'types/design/enums';
import { TLineNode, TVectorNode } from 'types/design/types';

// utils
import { buildClosedVectorLoop } from '../vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';
import { getBooleanStrokeColor } from '../booleanOperation/getBooleanStrokeColor';
import { getLineFrame } from './stroke/getLineFrame';
import { getLineFramePoint } from './stroke/getLineFramePoint';

export const getLineOffsetVector = (line: TLineNode, distance: number, join: StrokeJoin): Omit<TVectorNode, 'id'> => {
  const frame = getLineFrame(line);
  const corners = [
    getLineFramePoint(frame, -distance, distance),
    getLineFramePoint(frame, frame.length + distance, distance),
    getLineFramePoint(frame, frame.length + distance, -distance),
    getLineFramePoint(frame, -distance, -distance),
  ];

  return {
    ...buildClosedVectorLoop(corners, join === StrokeJoin.round ? distance : 0),
    defaultFill: null,
    filledFaceKeys: [],
    name: 'Vector',
    parentId: line.parentId,
    rotation: 0,
    strokeColor: getBooleanStrokeColor(line) ?? '#000000',
    strokeWidth: frame.halfWidth * 2,
    type: NodeType.vector,
    vertexHandleModes: {},
  };
};
