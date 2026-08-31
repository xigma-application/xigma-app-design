import { PathCommand } from 'opentype.js';

// types
import { TWalkState } from './types';

export const appendMoveCommand = (state: TWalkState, command: Extract<PathCommand, { type: 'M' }>): TWalkState => {
  const start = { x: command.x, y: command.y };

  return {
    current: start,
    edges: [],
    loops: state.edges.length > 0 ? [...state.loops, state.edges] : state.loops,
    subpathStart: start,
  };
};
