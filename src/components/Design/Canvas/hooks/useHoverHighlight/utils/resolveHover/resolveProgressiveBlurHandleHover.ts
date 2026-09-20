// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TOpenPropertyPanel } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getProgressiveBlurHandleAtPoint } from '../../../../utils/getProgressiveBlurHandleAtPoint';

export const resolveProgressiveBlurHandleHover = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  openPropertyPanel: TOpenPropertyPanel | null,
  refs: TCanvasRefs,
): void => {
  refs.progressiveBlur.hoveredEndpointRef.current =
    getProgressiveBlurHandleAtPoint(point, selectedNodes, viewport, openPropertyPanel)?.endpoint ?? null;
};
