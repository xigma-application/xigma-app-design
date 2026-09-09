// types
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TAxisAlign } from '../getAlignmentComponents';

// utils
import { getAutoLayoutBlockCounterLength } from '../getAutoLayoutBlockCounterLength';
import { getAutoLayoutLineThickness } from '../getAutoLayoutLineThickness';
import { getAxisOffset } from '../getAxisOffset';
import { getDistributedGap } from '../getDistributedGap';

export type TAutoLayoutWrappedCounterLayout = { counterOffset: number; effectiveCounterGap: number; lineThicknesses: number[] };

export const getAutoLayoutWrappedCounterLayout = (
  isHorizontal: boolean,
  lines: TAutoLayoutChildSize[][],
  alignTextBaseline: boolean,
  isCounterGapAuto: boolean,
  counterAxisSpacing: number,
  availableCounter: number,
  counterAlign: TAxisAlign,
): TAutoLayoutWrappedCounterLayout => {
  const lineThicknesses = lines.map((line) => getAutoLayoutLineThickness(isHorizontal, line, alignTextBaseline));
  const totalLineThickness = lineThicknesses.reduce((total, thickness) => total + thickness, 0);
  const effectiveCounterGap = isCounterGapAuto ? getDistributedGap(availableCounter, totalLineThickness, lines.length) : counterAxisSpacing;
  const blockCounterLength = getAutoLayoutBlockCounterLength(effectiveCounterGap, lineThicknesses);
  const counterOffset = isCounterGapAuto ? 0 : getAxisOffset(counterAlign, availableCounter, blockCounterLength);

  return { counterOffset, effectiveCounterGap, lineThicknesses };
};
