// types
import { TVectorNode, TVectorWidthPoint } from 'types/design/types';
import { TVectorWidthPointDragState } from 'types/design/canvas/types';

export const getPreviewWidthPoints = (
  node: TVectorNode,
  widthPointDrag: TVectorWidthPointDragState | null,
): Record<string, TVectorWidthPoint> => ({
  ...node.widthProfile?.points,
  ...(widthPointDrag?.nodeId === node.id ? { [widthPointDrag.point.id]: widthPointDrag.point } : {}),
  ...Object.fromEntries(
    (widthPointDrag?.groupTargets ?? []).filter((target) => target.nodeId === node.id).map((target) => [target.point.id, target.point]),
  ),
});
