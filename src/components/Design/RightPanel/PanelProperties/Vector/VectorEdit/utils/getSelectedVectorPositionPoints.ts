// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorHandlePoint } from './getVectorHandlePoint';

export const getSelectedVectorPositionPoints = (node: TVectorNode, vertexIds: string[], handles: TVectorHandleHover[]): TPoint[] =>
  vertexIds.length > 0 ? vertexIds.map((vertexId) => node.vertices[vertexId]) : handles.map((handle) => getVectorHandlePoint(node, handle));
