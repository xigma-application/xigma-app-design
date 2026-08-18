// others
import { ELLIPSE_ARC_MAX_RATIO } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawArcSpokes } from './drawArcSpokes';
import { drawRingMesh } from './drawRingMesh';
import { getEffectiveArcAngles } from '../ellipseArc/getEffectiveArcAngles';
import { getRingGeometry } from './getRingGeometry';
import { hasEllipseArc } from '../ellipseArc/hasEllipseArc';

const getHoleRect = (ellipse: TDraftRect, center: TPoint, arcRatio: number): TDraftRect => ({
  height: ellipse.height * arcRatio,
  width: ellipse.width * arcRatio,
  x: center.x - (ellipse.width * arcRatio) / 2,
  y: center.y - (ellipse.height * arcRatio) / 2,
});

const getHoleRing = (
  holeRect: TDraftRect,
  arcRatio: number,
  halfWidth: number,
  effectiveStartAngle: number,
  effectiveEndAngle: number,
  center: TPoint,
  flipX: boolean,
  flipY: boolean,
  rotation: number,
): ReturnType<typeof getRingGeometry> | null =>
  arcRatio > 0 ? getRingGeometry(holeRect, halfWidth, effectiveStartAngle, effectiveEndAngle, center, flipX, flipY, rotation) : null;

export const drawThickEllipseArcOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  ellipse: TDraftRect & { arcEndAngle: number; arcRatio?: number; arcRatioInverted?: boolean; arcStartAngle: number },
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  flipX: boolean,
  flipY: boolean,
  rotation: number,
): void => {
  const halfWidth = strokeWidth / viewport.zoom / 2;
  const center: TPoint = { x: ellipse.x + ellipse.width / 2, y: ellipse.y + ellipse.height / 2 };
  const { arcEndAngle, arcStartAngle } = ellipse;
  const arcRatio = Math.min(Math.max(ellipse.arcRatio ?? 0, 0), ELLIPSE_ARC_MAX_RATIO);
  const { effectiveEndAngle, effectiveStartAngle } = getEffectiveArcAngles(arcStartAngle, arcEndAngle, ellipse.arcRatioInverted ?? false);
  const mainRing = getRingGeometry(ellipse, halfWidth, effectiveStartAngle, effectiveEndAngle, center, flipX, flipY, rotation);
  const [firstRimPoint] = mainRing.rimPoints;
  const lastRimPoint = mainRing.rimPoints[mainRing.rimPoints.length - 1];
  const holeRect = getHoleRect(ellipse, center, arcRatio);
  const holeRing = getHoleRing(holeRect, arcRatio, halfWidth, effectiveStartAngle, effectiveEndAngle, center, flipX, flipY, rotation);
  const vertices = holeRing ? [...mainRing.vertices, ...holeRing.vertices] : mainRing.vertices;
  const firstSpokeStart = holeRing ? holeRing.rimPoints[0] : center;
  const lastSpokeStart = holeRing ? holeRing.rimPoints[holeRing.rimPoints.length - 1] : center;

  drawRingMesh(gl, program, buffer, vertices, color, canvasWidth, canvasHeight, viewport);

  if (hasEllipseArc(arcStartAngle, arcEndAngle)) {
    drawArcSpokes(
      gl,
      program,
      buffer,
      firstSpokeStart,
      firstRimPoint,
      lastSpokeStart,
      lastRimPoint,
      color,
      strokeWidth / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
