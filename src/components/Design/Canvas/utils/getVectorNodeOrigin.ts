// types
import { TVectorNode } from 'types/design/types';
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';

export const getVectorNodeOrigin = (node: TVectorNode): TVectorNodeOrigin => ({
  segments: Object.fromEntries(Object.values(node.segments).map((segment) => [segment.id, { ...segment }])),
  vertices: Object.fromEntries(Object.values(node.vertices).map((vertex) => [vertex.id, { x: vertex.x, y: vertex.y }])),
});
