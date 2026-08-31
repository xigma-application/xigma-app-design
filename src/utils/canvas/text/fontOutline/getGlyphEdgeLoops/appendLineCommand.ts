import { PathCommand } from 'opentype.js';

// types
import { TWalkState } from './types';

export const appendLineCommand = (state: TWalkState, command: Extract<PathCommand, { type: 'L' }>): TWalkState => {
  const end = { x: command.x, y: command.y };

  return { ...state, current: end, edges: [...state.edges, { end, start: state.current, tangentEnd: null, tangentStart: null }] };
};
