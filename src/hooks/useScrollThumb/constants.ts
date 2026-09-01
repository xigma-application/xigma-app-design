// types
import { TAxisProps, TScrollAxis } from './types';

export const AXIS_PROPS: Record<TScrollAxis, TAxisProps> = {
  x: { client: 'clientWidth', coord: 'clientX', scrollPos: 'scrollLeft', scrollSize: 'scrollWidth' },
  y: { client: 'clientHeight', coord: 'clientY', scrollPos: 'scrollTop', scrollSize: 'scrollHeight' },
};
