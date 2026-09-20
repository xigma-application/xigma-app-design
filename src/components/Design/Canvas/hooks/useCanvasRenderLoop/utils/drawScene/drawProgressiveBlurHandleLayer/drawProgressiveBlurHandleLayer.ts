// store
import { TOpenPropertyPanel } from 'store/design/types';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawGradientEndpointHandles } from '../drawGradientHandleLayer/drawGradientEndpointHandles';
import { drawGradientLine } from '../drawGradientHandleLayer/drawGradientLine';
import { drawProgressiveBlurLabel } from './drawProgressiveBlurLabel';
import { getActiveProgressiveBlurEndpoint } from './getActiveProgressiveBlurEndpoint';
import { getOpenProgressiveBlur } from '../../../../../utils/getOpenProgressiveBlur';
import { getProgressiveBlurLabelText } from './getProgressiveBlurLabelText';
import { getProgressiveBlurWorldPoints } from '../../../../../utils/getProgressiveBlurWorldPoints';

export const drawProgressiveBlurHandleLayer = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  openPropertyPanel: TOpenPropertyPanel | null,
  refs: TCanvasRefs,
): void => {
  const open = getOpenProgressiveBlur(selectedNodes, openPropertyPanel);

  if (open) {
    const { effect, effectIndex, node } = open;
    const points = getProgressiveBlurWorldPoints(node, effect);
    const activeEndpoint = getActiveProgressiveBlurEndpoint(refs, node.id, effectIndex);

    drawGradientLine(context, points.start, points.end);
    drawGradientEndpointHandles(context, [points.start, points.end]);

    if (activeEndpoint) {
      drawProgressiveBlurLabel(context, points[activeEndpoint], getProgressiveBlurLabelText(effect, activeEndpoint));
    }
  }
};
