// types
import { StrokeJoin } from 'types/design/enums';

const BOX_CORNER_ANGLE = 90;

export const getBoxStrokeJoin = (join: StrokeJoin, miterAngle: number | undefined): StrokeJoin =>
  join === StrokeJoin.miter && (miterAngle ?? 0) >= BOX_CORNER_ANGLE ? StrokeJoin.bevel : join;
