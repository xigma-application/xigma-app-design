// utils
import { isRotationAxisSwapped } from './isRotationAxisSwapped';

export const getRotatedAxisSigns = (scaleX: number, scaleY: number, rotation: number): { x: number; y: number } =>
  isRotationAxisSwapped(rotation) ? { x: scaleY, y: scaleX } : { x: scaleX, y: scaleY };
