// utils
import { getRotatedAxisScales } from '../getRotatedAxisScales';

export const getResizeAxisScale = (
  scaleX: number,
  scaleY: number,
  rotation: number,
  isSingleBoxOrigin: boolean,
): { x: number; y: number } =>
  isSingleBoxOrigin ? { x: Math.abs(scaleX), y: Math.abs(scaleY) } : getRotatedAxisScales(scaleX, scaleY, rotation);
