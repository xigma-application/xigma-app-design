// types
import { TVectorNode } from 'types/design/types';

export const hasVectorCornerRadius = (node: TVectorNode): boolean =>
  (node.cornerRadius ?? 0) > 0 || Object.values(node.cornerRadiusByVertexId ?? {}).some((radius) => radius > 0);
