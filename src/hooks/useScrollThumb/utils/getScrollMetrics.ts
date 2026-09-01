// types
import { TAxisProps, TScrollMetrics } from '../types';

export const getScrollMetrics = (scrollElement: HTMLDivElement, axis: TAxisProps): TScrollMetrics => {
  const client = scrollElement[axis.client];
  const scrollSize = scrollElement[axis.scrollSize];
  const maxScrollPos = scrollSize - client;

  return {
    sizeRatio: scrollSize > 0 ? client / scrollSize : 1,
    startRatio: maxScrollPos > 0 ? scrollElement[axis.scrollPos] / maxScrollPos : 0,
  };
};
