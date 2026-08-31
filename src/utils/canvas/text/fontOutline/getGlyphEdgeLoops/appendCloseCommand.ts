// types
import { TWalkState } from './types';

// utils
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

export const appendCloseCommand = (state: TWalkState): TWalkState => {
  const isBackAtStart = state.current.x === state.subpathStart.x && state.current.y === state.subpathStart.y;

  if (!isBackAtStart) {
    const closingEdge: TLoopEdge = { end: state.subpathStart, start: state.current, tangentEnd: null, tangentStart: null };

    return { ...state, current: state.subpathStart, edges: [...state.edges, closingEdge] };
  }

  return state;
};
