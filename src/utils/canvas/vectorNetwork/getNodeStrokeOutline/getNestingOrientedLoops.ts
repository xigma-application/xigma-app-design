// types
import { TPoint } from 'types/canvas';

// utils
import { getPositivelyWoundPolygon } from '../../line/stroke/getPositivelyWoundPolygon';
import { isPointInPolygonVertices } from 'components/Design/Canvas/utils/isPointInPolygonVertices';

export const getNestingOrientedLoops = (loops: TPoint[][]): TPoint[][] =>
  loops.map((loop, index) => {
    const depth = loops.filter((other, otherIndex) => otherIndex !== index && isPointInPolygonVertices(loop[0], other)).length;
    const positive = getPositivelyWoundPolygon(loop);

    return depth % 2 === 0 ? positive : [...positive].reverse();
  });
