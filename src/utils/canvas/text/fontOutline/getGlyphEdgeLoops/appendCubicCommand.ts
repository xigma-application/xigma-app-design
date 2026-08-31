import { PathCommand } from 'opentype.js';

// types
import { TWalkState } from './types';

// utils
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

export const appendCubicCommand = (state: TWalkState, command: Extract<PathCommand, { type: 'C' }>): TWalkState => {
  const end = { x: command.x, y: command.y };
  const control1 = { x: command.x1, y: command.y1 };
  const control2 = { x: command.x2, y: command.y2 };
  const edge: TLoopEdge = {
    end,
    start: state.current,
    tangentEnd: { x: control2.x - end.x, y: control2.y - end.y },
    tangentStart: { x: control1.x - state.current.x, y: control1.y - state.current.y },
  };

  return { ...state, current: end, edges: [...state.edges, edge] };
};
