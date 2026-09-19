// types
import { TCellEdgeName } from './types';

// others
import { SADDLES, SEGMENTS } from './constants';

export const getCellSegments = (index: number, isCenterInside: boolean): [TCellEdgeName, TCellEdgeName][] => {
  const saddle = SADDLES[index];

  if (saddle) {
    return isCenterInside ? saddle.connected : saddle.separate;
  }

  return SEGMENTS[index] ?? [];
};
