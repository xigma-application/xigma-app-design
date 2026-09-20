// types
import { TPoint } from 'types/canvas';

const LIGHT_RADIUS_X_PX = 19;
const LIGHT_RADIUS_Y_PX = 18;
const DIAL_CENTER_OFFSET_Y_PX = -11;

export const getGlassLightPosition = (angle: number): TPoint => {
  const radians = (angle * Math.PI) / 180;

  return { x: LIGHT_RADIUS_X_PX * Math.sin(radians), y: DIAL_CENTER_OFFSET_Y_PX - LIGHT_RADIUS_Y_PX * Math.cos(radians) };
};
