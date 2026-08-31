import { PathCommand } from 'opentype.js';

// types
import { TWalkState } from './types';

// utils
import { getQuadraticAsCubicTangents } from './getQuadraticAsCubicTangents';

export const appendQuadraticCommand = (state: TWalkState, command: Extract<PathCommand, { type: 'Q' }>): TWalkState => {
  const end = { x: command.x, y: command.y };
  const { tangentEnd, tangentStart } = getQuadraticAsCubicTangents(state.current, end, { x: command.x1, y: command.y1 });

  return { ...state, current: end, edges: [...state.edges, { end, start: state.current, tangentEnd, tangentStart }] };
};
