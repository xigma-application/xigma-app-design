// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { rotateVectorNodeOrigin } from '../../../../../utils/rotateVectorNodeOrigin';

export const getBakedRotatedVectorChanges = (
  origin: TVectorNodeOrigin & { fillRotation: number; rotation: number },
  pivot: TPoint,
  deltaDegrees: number,
): Pick<TVectorNode, 'fillRotation' | 'rotation' | 'segments' | 'vertices'> => {
  const baked = bakeVectorNodeRotation({
    rotation: origin.rotation,
    segments: origin.segments,
    vertices: Object.fromEntries(Object.entries(origin.vertices).map(([id, vertex]) => [id, { id, x: vertex.x, y: vertex.y }])),
  });
  const fillRotation = Math.round((origin.fillRotation + origin.rotation + deltaDegrees) * 100) / 100;

  return { fillRotation: fillRotation || undefined, rotation: 0, ...rotateVectorNodeOrigin(baked, pivot, deltaDegrees) };
};
