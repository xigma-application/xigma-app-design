// types
import { TVectorNode } from 'types/design/types';

export const getVectorVertexCornerRadius = (node: Pick<TVectorNode, 'cornerRadius' | 'cornerRadiusByVertexId'>, vertexId: string): number =>
  node.cornerRadiusByVertexId?.[vertexId] ?? node.cornerRadius ?? 0;
