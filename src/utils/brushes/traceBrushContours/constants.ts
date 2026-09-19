// types
import { TCellEdgeName } from './types';

export const THRESHOLD = 0.5;
export const MIN_LOOP_AREA = 3;
export const SIMPLIFY_EPSILON = 0.3;

const SEGMENTS: Record<number, [TCellEdgeName, TCellEdgeName][]> = {
  1: [['left', 'top']],
  11: [['right', 'bottom']],
  12: [['left', 'right']],
  13: [['top', 'right']],
  14: [['left', 'top']],
  2: [['top', 'right']],
  3: [['left', 'right']],
  4: [['right', 'bottom']],
  6: [['top', 'bottom']],
  7: [['left', 'bottom']],
  8: [['left', 'bottom']],
  9: [['top', 'bottom']],
};

const SADDLES: Record<number, { connected: [TCellEdgeName, TCellEdgeName][]; separate: [TCellEdgeName, TCellEdgeName][] }> = {
  10: {
    connected: [
      ['left', 'top'],
      ['right', 'bottom'],
    ],
    separate: [
      ['top', 'right'],
      ['left', 'bottom'],
    ],
  },
  5: {
    connected: [
      ['top', 'right'],
      ['left', 'bottom'],
    ],
    separate: [
      ['left', 'top'],
      ['right', 'bottom'],
    ],
  },
};

export { SADDLES, SEGMENTS };
