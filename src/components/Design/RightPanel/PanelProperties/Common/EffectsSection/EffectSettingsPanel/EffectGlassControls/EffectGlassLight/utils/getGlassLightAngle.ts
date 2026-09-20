export const getGlassLightAngle = (deltaX: number, deltaY: number): number => Math.round((Math.atan2(deltaX, -deltaY) * 180) / Math.PI);
