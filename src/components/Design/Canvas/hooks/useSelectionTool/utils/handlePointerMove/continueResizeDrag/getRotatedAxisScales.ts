// utils
import { isRotationAxisSwapped } from './isRotationAxisSwapped';

export const getRotatedAxisScales = (scaleX: number, scaleY: number, rotation: number): { x: number; y: number } =>
  isRotationAxisSwapped(rotation) ? { x: Math.abs(scaleY), y: Math.abs(scaleX) } : { x: Math.abs(scaleX), y: Math.abs(scaleY) };
