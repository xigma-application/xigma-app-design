// types
import { TAxisAlign } from './getAlignmentComponents';

export const getAxisOffset = (align: TAxisAlign, containerSize: number, contentSize: number): number => {
  if (align === 'center') {
    return (containerSize - contentSize) / 2;
  }

  return align === 'end' ? containerSize - contentSize : 0;
};
