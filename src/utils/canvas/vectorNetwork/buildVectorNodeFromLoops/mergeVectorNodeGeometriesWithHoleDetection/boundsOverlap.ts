// types
import { TBounds } from './types';

export const boundsOverlap = (a: TBounds, b: TBounds): boolean => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
