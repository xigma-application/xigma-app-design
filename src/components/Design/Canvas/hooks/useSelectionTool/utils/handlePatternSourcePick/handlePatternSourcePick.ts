// utils
import { doesNodeHavePatternInSubtree } from './doesNodeHavePatternInSubtree';
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { getPaintsChange } from 'utils/design/paint/getPaintsChange';
import { getGroupChildHitAtPoint } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerDown/getGroupChildHitAtPoint';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getSelectionHitAtPoint } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerDown/getSelectionHitAtPoint/getSelectionHitAtPoint';
import { isControlPressed } from 'utils/isControlPressed';
import { screenToWorld } from 'utils/transform/screenToWorld';

// store
import { selectNodes, selectOrderedNodes, selectPatternSourcePickTarget, selectViewport } from 'store/design/selectors';
import { setPatternSourcePicking, updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TPaint } from 'types/design/paint/types';

export const handlePatternSourcePick = (canvas: HTMLCanvasElement, event: PointerEvent, dispatch: AppDispatch): void => {
  if (event.button === MouseButton.primary) {
    const state = store.getState();
    const target = selectPatternSourcePickTarget(state);

    if (target) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const nodesById = selectNodes(state);
      const controlHit = isControlPressed(event) ? getGroupChildHitAtPoint(point, viewport) : null;
      const hit = controlHit ?? getSelectionHitAtPoint(point, selectOrderedNodes(state), viewport);

      if (hit && !doesNodeHavePatternInSubtree(hit, nodesById)) {
        const targetNode = nodesById[target.nodeId];

        if (targetNode && 'fills' in targetNode) {
          const paints = getNodePaints(targetNode, target.property);
          const paint = paints[target.paintIndex];

          if (paint && paint.type === 'pattern') {
            const nextPaints: TPaint[] = paints.map((entry, index) =>
              index === target.paintIndex ? { ...paint, frozenSourceSnapshot: null, sourceNodeId: hit.id } : entry,
            );

            dispatch(updateNode({ changes: getPaintsChange(target.property, nextPaints), id: target.nodeId }));
          }
        }
      }

      dispatch(setPatternSourcePicking(false));
    }
  }
};
