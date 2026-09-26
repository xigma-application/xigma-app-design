// others
import { LINE_OFFSET_FALLBACK_STROKE } from './constants';

// types
import { NodeType, StrokeJoin } from 'types/design/enums';
import { TLineNode, TVectorNode } from 'types/design/types';

// utils
import { buildClosedVectorLoop } from '../vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';
import { getLineFrame } from './stroke/getLineFrame';
import { getLineFramePoint } from './stroke/getLineFramePoint';
import { getLineVectorStrokeSettings } from './getLineVectorStrokeSettings';
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';

export const getLineOffsetVector = (line: TLineNode, distance: number, join: StrokeJoin): Omit<TVectorNode, 'id'> => {
  const frame = getLineFrame(line);
  const corners = [
    getLineFramePoint(frame, -distance, distance),
    getLineFramePoint(frame, frame.length + distance, distance),
    getLineFramePoint(frame, frame.length + distance, -distance),
    getLineFramePoint(frame, -distance, -distance),
  ];

  return {
    ...getLineVectorStrokeSettings(line),
    ...buildClosedVectorLoop(corners, join === StrokeJoin.round ? distance : 0),
    defaultFill: null,
    filledFaceKeys: [],
    name: 'Vector',
    parentId: line.parentId,
    rotation: 0,
    strokeWidth: frame.halfWidth * 2,
    strokes: line.strokes.length > 0 ? line.strokes : [makeSolidPaint(LINE_OFFSET_FALLBACK_STROKE)],
    type: NodeType.vector,
    vertexHandleModes: {},
  };
};
