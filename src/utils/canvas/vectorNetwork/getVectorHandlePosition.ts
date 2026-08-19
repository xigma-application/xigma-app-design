// types
import { TPoint } from 'types/canvas';
import { TVectorTangent } from 'types/design/types';

export const getVectorHandlePosition = (vertex: TPoint, tangent: TVectorTangent): TPoint | null =>
  tangent ? { x: vertex.x + tangent.x, y: vertex.y + tangent.y } : null;
