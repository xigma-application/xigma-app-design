// types
import { TPoint } from 'types/canvas';
import { TVectorFace } from '../vectorNetwork/deriveVectorFaces/deriveVectorFaces';

// utils
import { getBooleanFacePoint } from './getBooleanFacePoint';
import { getPolygonArea } from 'components/Design/Canvas/utils/getPolygonArea';
import { getVectorFillLoopKey } from '../vectorNetwork/getVectorFillLoopKey';
import { isPointInEvenOddPolygons } from './isPointInEvenOddPolygons';

export const getBooleanFilledFaceKeys = (faces: TVectorFace[], isInside: (point: TPoint) => boolean): string[] => {
  const chosenPolygons: TPoint[][] = [];
  const chosenKeys: string[] = [];

  [...faces]
    .sort((faceA, faceB) => getPolygonArea(faceB.points) - getPolygonArea(faceA.points))
    .forEach((face) => {
      const point = getBooleanFacePoint(face.points);

      if (isInside(point) !== isPointInEvenOddPolygons(point, chosenPolygons)) {
        chosenPolygons.push(face.points);
        chosenKeys.push(getVectorFillLoopKey(face.pieceKeys));
      }
    });

  return chosenKeys;
};
