// types
import { TVectorTangent } from 'types/design/types';

export const scaleTangent = (tangent: TVectorTangent, scaleX: number, scaleY: number): TVectorTangent =>
  tangent ? { x: tangent.x * scaleX, y: tangent.y * scaleY } : null;
