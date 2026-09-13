// types
import { TPaint } from 'types/design/paint/types';

export const toggleFillVisibility = (fills: TPaint[], index: number): TPaint[] =>
  fills.map((fill, fillIndex) => (fillIndex === index ? { ...fill, visible: fill.visible === false ? undefined : false } : fill));
