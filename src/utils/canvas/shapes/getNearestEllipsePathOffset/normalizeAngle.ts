// others
import { TWO_PI } from './constants';

export const normalizeAngle = (angle: number): number => ((angle % TWO_PI) + TWO_PI) % TWO_PI;
