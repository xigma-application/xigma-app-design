import { PathCommand } from 'opentype.js';

// types
import { TWalkState } from './types';

// utils
import { appendCloseCommand } from './appendCloseCommand';
import { appendCubicCommand } from './appendCubicCommand';
import { appendLineCommand } from './appendLineCommand';
import { appendMoveCommand } from './appendMoveCommand';
import { appendQuadraticCommand } from './appendQuadraticCommand';

export const applyPathCommand = (state: TWalkState, command: PathCommand): TWalkState => {
  switch (command.type) {
    case 'M':
      return appendMoveCommand(state, command);
    case 'L':
      return appendLineCommand(state, command);
    case 'Q':
      return appendQuadraticCommand(state, command);
    case 'C':
      return appendCubicCommand(state, command);
    case 'Z':
      return appendCloseCommand(state);
    // no default
  }
};
